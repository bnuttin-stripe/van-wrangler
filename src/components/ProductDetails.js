import React from 'react';
import Carousel from './Carousel';

const styles = {
    carousel: {
        boxShadow: 'silver 0px 0px 6px 0px',
        marginBottom: 20
    }
}

export default function ProductDetails(props) {
    return (
        <>
            <div style={styles.carousel}>
                <Carousel id={props.product.id} images={props.product.images} />
            </div>
            <p>{props.product.description}</p>
            <p>Features:</p>
            <ul>
                {Object.keys(props.product.metadata).map(key =>
                    <li key={key}><strong>{key + ': '}</strong>{props.product.metadata[key]}</li>
                )}
                </ul>
        </>
    );
}