import React, { useState, useEffect } from 'react';
import NumberFormat from 'react-number-format';

export default function ProfileBookings(props) {
    const [processing, setProcessing] = useState(true);
    const [bookings, setBookings] = useState();

    const styles = {
        table: {
            color: '#425466'
        },
        header: {
            borderBottom: '2px solid #425466'
        }
    }

    useEffect(() => {
        setProcessing(true);
        let bookings = [];
        fetch('/payments/' + props.custId)
            .then(res => res.json())
            .then(data => {
                console.log(data)
                data.map((payment) => {
                    if (payment.status === 'succeeded' && payment.metadata.productName) {
                        bookings.push({
                            id: payment.id,
                            name: payment.metadata.productName,
                            from: payment.metadata.from,
                            to: payment.metadata.to,
                            amount: payment.amount_received / 100,
                            receipt_url: payment.charges.data[0].receipt_url
                        })
                    }
                })
                setBookings(bookings);
                setProcessing(false);
            })
    }, []);

    return (
        <>
            <h2>Your Bookings</h2>
            <div className="col">
                <table className="table table-borderless" style={styles.table}>
                    <thead>
                        <tr style={styles.header}>
                            <th>Vehicle</th>
                            <th>From</th>
                            <th>Until</th>
                            <th>Receipt</th>
                            <th>Amount Paid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processing && <tr><td>
                            <div className="spinner-border spinner-border-sm" style={{margin:10}} role="status"></div>
                        </td></tr>
                        }
                        {!processing && bookings.map((booking, key) => (
                            <tr key={key}>
                                <td>{booking.name}</td>
                                <td>{booking.from}</td>
                                <td>{booking.to}</td>
                                <td><a href={booking.receipt_url} target='_blank'>{booking.id}</a></td>
                                <td style={{ textAlign: 'right' }}><NumberFormat value={booking.amount} displayType={'text'} thousandSeparator={true} prefix={'$'} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
