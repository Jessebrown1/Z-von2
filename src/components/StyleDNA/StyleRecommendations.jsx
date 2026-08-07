import ProductCard from '../ProductCard';

export default function StyleRecommendations({ recommendations, stretchPick }) {
  return (
    <div className="style-recommendations">
      {recommendations.length > 0 && (
        <>
          <p className="style-recommendations-heading">We Think You'll Like</p>
          <div className="style-recommendations-grid">
            {recommendations.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}

      {stretchPick && (
        <div className="style-stretch-pick">
          <p className="style-recommendations-heading">Worth Stepping Outside Your Usual</p>
          <div className="style-stretch-pick-inner">
            <div className="style-stretch-pick-product">
              <ProductCard product={stretchPick.product} />
            </div>
            <p className="style-stretch-pick-reason">{stretchPick.reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
