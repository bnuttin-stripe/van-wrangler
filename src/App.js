// Modules
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Components and containers
import ProductList from './components/ProductList';
import ProductPage from './components/ProductPage';
import CheckoutConfirm from './components/CheckoutConfirm';
import Subscribe from './components/Subscribe';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import Header from './components/Header';
import './styles/index.css';

// Actions
import useToken from './actions/useToken';

//const promise = loadStripe(process.env.REACT_APP_PK, {stripeAccount: 'acct_1IzoRlK8JPnY2LKn'});
const promise = loadStripe(process.env.REACT_APP_PK);

export default function App() {
    const { token, setToken } = useToken();

    if (!token) {
        return (
            <BrowserRouter>
                <Header />
                <Switch>
                    <Route path="/register">
                        <Register setToken={setToken} />
                    </Route>
                    <Route path="/">
                        <Login setToken={setToken} />
                    </Route>
                </Switch>
            </BrowserRouter>
        )
    }

    return (
        <BrowserRouter>
            <Header setToken={setToken} email={token.email} custId={token.id} />
            <Switch>
                <Route path="/product/:id">
                    <Elements stripe={promise}>
                        <ProductPage custId={token.id} email={token.email} />
                    </Elements>
                </Route>
                <Route path="/confirm/:id">
                    <CheckoutConfirm />
                </Route>
                <Route path="/profile">
                    <Profile />
                </Route>
                <Route path="/">
                    {/*<Subscribe /> */}
                    <ProductList />
                </Route>
            </Switch>
        </BrowserRouter>
    );
}
