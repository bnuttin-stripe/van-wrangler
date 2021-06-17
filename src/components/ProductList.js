import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard.js';
const PASSNAME = 'WranglerPass';

export default function ProductList(props) {
  // Data
  //const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState([]);
  const [prices, setPrices] = useState([]);

  // Parse out the prices array to find the price corresponding to a specific product
  const getPrice = (productid) => {
    let myPrice = {};
    let discounted = prices.find(x=>x.product === productid && x.nickname === PASSNAME) !== undefined;
    let selectedPrice = prices.find(x=>x.product === productid && x.nickname === PASSNAME) || prices.find(x=>x.product === productid);
    myPrice.discounted = discounted;
    myPrice.id = selectedPrice.id;
    myPrice.amount = selectedPrice.unit_amount / 100;
    myPrice.type = selectedPrice.type;
    myPrice.active = selectedPrice.active;
    return myPrice;  
  }

  // On intitial load only, fetch all the products and prices
  useEffect(() => {
    let urls = ['/products', '/prices'];
    let requests = urls.map(url => fetch(url));
    Promise.all(requests)
      .then(responses => Promise.all(responses.map(r => r.json())))
      .then(function (responses) {
        setProducts(responses[0].data);
        setPrices(responses[1].data);
        setIsLoaded(true);
      });
  }, []);

  /*if (error) {
    return <div>Error: {error.message}</div>;
  } else */
  if (!isLoaded) {
    return <div>Loading your experiences...</div>;
  }
  else {
    return (
      <div>
        <div className="row row-cols-1 row-cols-lg-4 g-4">
          {products.map((product, key) => (
            <ProductCard
              id={product.id}
              name={product.name}
              src={product.images}
              images={product.images}
              price={getPrice(product.id)}
              description={product.description}
              features={product.metadata}
              key={key} />
          ))}
        </div>
      </div>
    );
  }
}


