import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import ProductDetails from './ProductDetails';
import ProductConfirm from './ProductConfirm';

export default function CheckoutConfirm() {
    const { id } = useParams();
    //const [error, setError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [product, setProduct] = useState();
    const [productId, setProductId] = useState();
    const [productName, setProductName] = useState();
    const [email, setEmail] = useState();
    const [receipt, setReceipt] = useState();

    useEffect(() => {
        window
            .fetch('/session/' + id)
            .then(res => res.json())
            .then(obj => {
                setProductId(obj.productId);
                setProductName(obj.productName);
                setEmail(obj.email);
                setReceipt(obj.receipt);
            });
    }, [id]); 

    useEffect(() => {
        if (productId){
            window
                .fetch('/productdetails/' + productId)
                .then(res => res.json())
                .then(obj => {
                    setProduct(obj.product);
                })
                .then(() => setIsLoaded(true));
            }
      }, [productId]);

    if (!isLoaded) {
        return <div>Loading...</div>;
    }
    else {
        return (
            <>
                <div className="row">
                    <div className="col-6 gx-5">
                        {product && <ProductDetails product={product} />}
                    </div>

                    <div className="col-5 gx-5">
                        <ProductConfirm productName={productName} email={email} receipt={receipt} />
                    </div>
                </div >
            </>
        );
    }
}