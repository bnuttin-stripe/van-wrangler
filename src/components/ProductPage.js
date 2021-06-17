import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import ProductDetails from './ProductDetails';
import ProductReserve from './ProductReserve';

export default function ProductPage(props) {
    const { id } = useParams();
    //const [error, setError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [product, setProduct] = useState();

    useEffect(() => {
        fetch('/productdetails/' + id)
            .then(res => res.json())
            .then(obj => {
                setProduct(obj.product);
            })
            .then(() => setIsLoaded(true));
    }, []);

    if (!isLoaded) {
        return <div>Loading...</div>;
    }
    else {
        return (
            <>
                <div className="row">
                    <div className="col-6 gx-5">
                        <ProductDetails product={product} />
                    </div>

                    <div className="col-6 gx-5">
                        <ProductReserve product={product} custId={props.custId} email={props.email}/>
                    </div>
                </div >
            </>
        );
    }
}