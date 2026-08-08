import { useRef, useState } from 'react';
import { createProduct, updateProduct, uploadImage } from '../../utils/adminApi';
import './ProductForm.css';

const CATEGORIES = ['Hoodies', 'T-Shirts', 'Bottoms', 'Outerwear', 'Accessories'];

function toCsv(list) {
  return (list || []).join(', ');
}

function fromCsv(text) {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function emptyForm() {
  return {
    name: '',
    category: CATEGORIES[0],
    price: '',
    description: '',
    details: '',
    sizes: '',
    colors: '',
    isNew: false,
    isLimited: false,
    editionSize: '',
    dropNumber: '1',
    moodTags: '',
    occasionTags: '',
    silhouette: '',
    fit: '',
    weightGsm: '',
    colorFamily: '',
    images: [],
  };
}

function productToForm(product) {
  return {
    name: product.name,
    category: product.category,
    price: String(product.price),
    description: product.description || '',
    details: toCsv(product.details),
    sizes: toCsv(product.sizes),
    colors: toCsv(product.colors),
    isNew: product.isNew,
    isLimited: product.isLimited,
    editionSize: product.editionSize ? String(product.editionSize) : '',
    dropNumber: String(product.dropNumber || 1),
    moodTags: toCsv(product.moodTags),
    occasionTags: toCsv(product.occasionTags),
    silhouette: product.silhouette || '',
    fit: product.fit || '',
    weightGsm: product.weightGsm ? String(product.weightGsm) : '',
    colorFamily: product.colorFamily || '',
    images: product.images || [],
  };
}

/** Create/edit form for a single product — description + image upload live here. */
export default function ProductForm({ product, onSaved, onCancel }) {
  const isEditing = Boolean(product);
  const [form, setForm] = useState(() => (product ? productToForm(product) : emptyForm()));
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError(null);
    setIsUploading(true);
    try {
      const results = await Promise.allSettled(files.map((file) => uploadImage(file)));
      const uploaded = [];
      const failed = [];
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') uploaded.push(result.value.url);
        else failed.push(files[i].name);
      });
      if (uploaded.length) setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
      if (failed.length) setError(`Failed to upload: ${failed.join(', ')}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.price) {
      setError('Name and price are required.');
      return;
    }
    if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
      setError('Price must be a non-negative number.');
      return;
    }
    if (form.editionSize && (!Number.isFinite(Number(form.editionSize)) || Number(form.editionSize) < 0)) {
      setError('Edition size must be a non-negative number.');
      return;
    }
    if (form.weightGsm && (!Number.isFinite(Number(form.weightGsm)) || Number(form.weightGsm) < 0)) {
      setError('Weight (GSM) must be a non-negative number.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      description: form.description.trim(),
      details: fromCsv(form.details),
      sizes: fromCsv(form.sizes),
      colors: fromCsv(form.colors),
      isNew: form.isNew,
      isLimited: form.isLimited,
      editionSize: form.isLimited && form.editionSize ? Number(form.editionSize) : null,
      dropNumber: form.isLimited && form.dropNumber ? Number(form.dropNumber) : 1,
      moodTags: fromCsv(form.moodTags),
      occasionTags: fromCsv(form.occasionTags),
      silhouette: form.silhouette.trim() || 'regular',
      fit: form.fit.trim() || 'true-to-size',
      weightGsm: form.weightGsm ? Number(form.weightGsm) : null,
      colorFamily: form.colorFamily.trim() || null,
      images: form.images,
    };

    setIsSaving(true);
    try {
      if (isEditing) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || 'Could not save product.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="product-form-header">
        <h2 className="serif">{isEditing ? `Edit ${product.name}` : 'Add Product'}</h2>
        <button type="button" className="product-form-cancel" onClick={onCancel}>
          &larr; Back to products
        </button>
      </div>

      <div className="product-form-grid">
        <div className="product-form-fields">
          <label className="admin-field">
            <span>Name</span>
            <input value={form.name} onChange={handleChange('name')} required />
          </label>

          <div className="admin-field-row">
            <label className="admin-field">
              <span>Category</span>
              <select value={form.category} onChange={handleChange('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>Price (GHS)</span>
              <input type="number" min="0" value={form.price} onChange={handleChange('price')} required />
            </label>
          </div>

          <label className="admin-field">
            <span>Description</span>
            <textarea value={form.description} onChange={handleChange('description')} rows={4} />
          </label>

          <label className="admin-field">
            <span>Details (comma-separated)</span>
            <input value={form.details} onChange={handleChange('details')} placeholder="480gsm cotton, Garment-dyed" />
          </label>

          <div className="admin-field-row">
            <label className="admin-field">
              <span>Sizes (comma-separated)</span>
              <input value={form.sizes} onChange={handleChange('sizes')} placeholder="S, M, L, XL" />
            </label>
            <label className="admin-field">
              <span>Colors (comma-separated)</span>
              <input value={form.colors} onChange={handleChange('colors')} placeholder="Black, Gold" />
            </label>
          </div>

          <div className="admin-field-row admin-field-row--checks">
            <label className="admin-checkbox">
              <input type="checkbox" checked={form.isNew} onChange={handleChange('isNew')} />
              <span>Mark as New</span>
            </label>
            <label className="admin-checkbox">
              <input type="checkbox" checked={form.isLimited} onChange={handleChange('isLimited')} />
              <span>Limited Edition</span>
            </label>
            {form.isLimited && (
              <>
                <label className="admin-field admin-field--inline">
                  <span>Edition size</span>
                  <input type="number" min="1" value={form.editionSize} onChange={handleChange('editionSize')} />
                </label>
                <label className="admin-field admin-field--inline">
                  <span>Drop number</span>
                  <input type="number" min="1" value={form.dropNumber} onChange={handleChange('dropNumber')} />
                </label>
              </>
            )}
          </div>

          <p className="admin-field-label product-form-dna-heading">Product DNA</p>
          <p className="product-form-dna-hint">
            Powers Product DNA, Mood Shopping and ZÉVON AI matching. Mood tags: dark, minimal, rebellious, elegant,
            night, raw, confident, quiet-luxury. Occasion tags: date-night, party, casual, dinner, event, everyday,
            just-because.
          </p>

          <label className="admin-field">
            <span>Mood tags (comma-separated)</span>
            <input value={form.moodTags} onChange={handleChange('moodTags')} placeholder="dark, raw, confident" />
          </label>

          <label className="admin-field">
            <span>Occasion tags (comma-separated)</span>
            <input value={form.occasionTags} onChange={handleChange('occasionTags')} placeholder="casual, everyday" />
          </label>

          <div className="admin-field-row">
            <label className="admin-field">
              <span>Silhouette</span>
              <input value={form.silhouette} onChange={handleChange('silhouette')} placeholder="oversized" />
            </label>
            <label className="admin-field">
              <span>Fit</span>
              <input value={form.fit} onChange={handleChange('fit')} placeholder="relaxed" />
            </label>
          </div>

          <div className="admin-field-row">
            <label className="admin-field">
              <span>Weight (GSM)</span>
              <input type="number" min="0" value={form.weightGsm} onChange={handleChange('weightGsm')} />
            </label>
            <label className="admin-field">
              <span>Color family</span>
              <input value={form.colorFamily} onChange={handleChange('colorFamily')} placeholder="black" />
            </label>
          </div>
        </div>

        <div className="product-form-images">
          <span className="admin-field-label">Images</span>
          <div className="product-form-image-grid">
            {form.images.map((url, index) => (
              <div className="product-form-image" key={index}>
                <img src={url} alt="" />
                <button type="button" onClick={() => removeImage(index)} aria-label="Remove image">
                  &times;
                </button>
              </div>
            ))}
            <label className="product-form-image-upload">
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} hidden />
              {isUploading ? 'Uploading…' : '+ Upload'}
            </label>
          </div>
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <button type="submit" className="admin-submit" disabled={isSaving || isUploading}>
        {isSaving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Product'}
      </button>
    </form>
  );
}
