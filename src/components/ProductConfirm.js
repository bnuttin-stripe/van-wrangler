import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function ProductConfirm(props) {
    const styles = {
        title: {
            fontWeight: 500,
            fontSize: '2em'
        },
        success: {
            fontSize: 'larger'
        },
        bolded: {
            fontWeight: 500
        }
    }

    return (
        <>
            <div className="row">
                <p style={styles.title}>Reserve {props.productName}</p>
            </div>
            <div className="row">
                <div className="col" style={styles.success}>
                    <FontAwesomeIcon icon={faCheckCircle} /> You're all set! We'll send an email to <span style={styles.bolded}>{props.email}</span> with all the relevant details.<br /><br />
                    Your receipt number is: <span style={styles.bolded}>{props.receipt}</span>
                </div>
            </div>
        </>
    );
}