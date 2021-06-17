import React, { useState, useEffect } from 'react';
import ProfileInfo from './ProfileInfo';
import ProfileBookings from './ProfileBookings';
import ProfileSubscribe from './ProfileSubscribe';

export default function Profile() {
    const token = JSON.parse(sessionStorage.getItem('token'));
    const custId = token.id;
    const [processing, setProcessing] = useState(true);
    const [subs, setSubs] = useState(0);
    
    const styles = {
        spacer: {
            marginTop: 50
        }
    }

    useEffect(() => {
        fetch('/subscription/' + custId)
            .then(res => res.json())
            .then(data => {
                setSubs(data);
            })
    }, []);

    return (
        <div className="row">
            <div className="col-3">
                <ProfileInfo custId={custId} />
            </div>
            <div className="col-8 offset-1">
                <div className="row">
                    <ProfileSubscribe custId={custId}/>
                </div>
                <div className="row" style={styles.spacer}>
                    <ProfileBookings custId={custId}/>
                </div>
            </div>
        </div>
    )
}
