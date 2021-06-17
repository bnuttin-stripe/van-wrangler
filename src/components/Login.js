import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Login({ setToken }) {
    const [email, setEmail] = useState('');
    const [formValid, setFormValid] = useState(false);
    const [loginValid, setLoginValid] = useState(true);

    const styles = {
        loginError: {
            color: 'red'
        },
        whiteButton: {
            color: 'white'
        },
        topPadding: {
            paddingTop: 100
        }
    }

    const login = async e => {
        e.preventDefault();
        //setProcessing(true);
        fetch("/customer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mode: 'check',
                email: email
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.custId !== ""){
                    setToken({id: data.custId, email: email});
                }
                setLoginValid(data.custId !== "");
                //setProcessing(false);
            });
    }

    useEffect(() => {
        setFormValid(email !== '')
    }, [email]);

    return (
        <div className="row justify-content-center align-items-center" style={styles.topPadding}>
            <form className="col-4" onSubmit={login}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="text" required className="form-control" id="email" onChange={e => setEmail(e.target.value)} />
                    { !loginValid && <small className="form-text" style={styles.loginError}>Email not found; please click the Register button to register a new account.</small>}
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" id="password" className="form-control" />
                    <small className="form-text">Password is not functional in demo app</small>
                </div>
                <div className="mb-3">
                    <button disabled={!formValid} className="form-control btn btn-primary" type="submit">Login</button>
                    </div>
                <div className="mb-3">
                    <Link to="/register"><button className="form-control btn btn-secondary" style={styles.whiteButton} type="submit">Register</button></Link>
                </div>
            </form>
        </div>



    )
}
