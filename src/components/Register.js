import React, { useState, useEffect } from 'react';

export default function Register({ setToken }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState();
    const [password, setPassword] = useState('');
    const [custId, setCustId] = useState('');
    const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);
    const [formValid, setFormValid] = useState(false);
    const [processing, setProcessing] = useState(false);

    const styles = {
        emailError: {
            color: 'red'
        },
        topPadding: {
            paddingTop: 100
        }
    }

    // Check customer is not already registered
    const checkCustomer = () => {
        if (email) {
            fetch("/customer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mode: 'check',
                    email: email,
                })
            })
                .then(res => res.json())
                .then(data => {
                    setCustId(data.custId);
                    setEmailAlreadyRegistered(data.custId !== '');
                });
        }
    }

    // Create the actual customer
    const createCustomer = (e) => {
        e.preventDefault();
        setProcessing(true);
        fetch("/customer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mode: 'create',
                name: name,
                phone: phone,
                email: email,
            })
        })
            .then(res => res.json())
            .then(data => {
                setProcessing(false);
                setCustId(data.custId);
                setToken({id: data.custId, email: email});
            });
    }

    useEffect(() => {
        setFormValid(name !== '' && email !== '' && password !== '' && !emailAlreadyRegistered)
    }, [name, email, emailAlreadyRegistered, password]);

    return (
        <div className="row justify-content-center align-items-center" style={styles.topPadding}>
            <form className="col-4" onSubmit={createCustomer}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" className="form-control" onChange={e => setName(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="text" className="form-control" onChange={e => setEmail(e.target.value)} onBlur={checkCustomer} />
                    {emailAlreadyRegistered && <small className="form-text" style={styles.emailError}>This email is already registered</small>}
                </div>
                <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input type="text" className="form-control" onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input className="form-control" type="password" onChange={e => setPassword(e.target.value)} />
                    <small className="form-text">Password is not functional in demo app</small>
                </div>
                <button className="form-control btn btn-primary" disabled={!formValid || custId !== '' || processing} type="submit">
                    <span id="button-text">
                        {processing ? <div className="spinner" id="spinner"></div> : "Register"}
                    </span>
                </button>
            </form>
        </div>

    )
}
