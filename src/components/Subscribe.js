import React, { useState, useEffect } from 'react';
import Collapse from 'react-bootstrap/Collapse';
//import { Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronCircleDown, faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';
import Badge from 'react-bootstrap/Badge';

export default function Subscribe(props) {
    const [showDetails, setShowDetails] = useState(false);

    const styles = {
        showMore: {
            fontSize: 'x-large',
            float: 'right'
        }
    };

    const toggleInfo = (e) => {
        e.preventDefault();
        setShowDetails(!showDetails);
    }

    return (
        <>
            <div className="row">
                <div className="col">
                    Vehicles with orange prices are discounted via the WranglerPass Program!
                    <FontAwesomeIcon style={styles.showMore} icon={showDetails ? faChevronCircleUp : faChevronCircleDown} onClick={toggleInfo} />
                </div>
            </div>
            <Collapse in={showDetails}>
                <div className="row">
                    <div className="col">
                    <Badge variant="primary">desrgdgrg</Badge>
                    </div>
                </div>
            </Collapse>
        </>

    );
}