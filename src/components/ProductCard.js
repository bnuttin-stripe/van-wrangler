import React from 'react';
import { Link } from 'react-router-dom';
import Carousel from './Carousel';
const MEMBERSHIP = 'prod_JON9hZOGiKsh3K';

export default function ProductCard(props) {
    const styles = {
        blurplebutton: {
            float: 'right',
            backgroundColor: '#635BFF',
            color: 'white',
            borderRadius: 4,
            fontSize: 'smaller',
            padding: '4px 8px',
            border: 0
        },
        orangebutton: {
            float: 'right',
            backgroundColor: 'orange',
            color: 'white',
            borderRadius: 4,
            fontSize: 'smaller',
            padding: '4px 8px',
            border: 0
        }
    };

    if (props.price.type !== 'recurring' && props.price.active) {
        return (
            <div className="col">
                <div className="card h-100">
                    <Carousel id={props.id} images={props.images} />
                    <div className="card-body">
                        <h5 className="card-title">{props.name}
                            <Link to={'/product/' + props.id}>
                                <button style={props.price.discounted ? styles.orangebutton : styles.blurplebutton }>
                                    {"$" + props.price.amount + "/ day"}
                                </button>
                            </Link>
                        </h5>
                        <p className="card-text" style={{ paddingTop: '20px' }}>{props.description}</p>
                    </div>
                </div>
            </div>
        );
    }
    else {
        return '';
    }
}