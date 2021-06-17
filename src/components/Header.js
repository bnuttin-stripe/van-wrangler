import React from 'react';
import logo from '../images/campervan.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const styles = {
    spacer: {
        marginBottom: 40,
        marginTop: 30
    },
    title: {
        fontSize: '4em',
        letterSpacing: '-3px',
        fontWeight: 400
    },
    subtitle: {
        color: '#0A2540',
        fontSize: '2rem'
    },
    logo: {
        width: 70,
        height: 70,
        float: 'left',
        margin: '10px 20px 10px 10px'
    },
    logout: {
        float: 'right',
        marginTop: 52
    },
    logoutIcon: {
        fontSize: 'xx-large',
        marginLeft: 20,
        marginBottom: -5
    },
    profile: {
        color: '#425466',
        textDecoration: 'none'
    }
}

//export default function Header({ setToken }, props) {
export default function Header(props) {
    const logout = () => {
        props.setToken('');
    }

    return (
        <div className="row" style={styles.spacer}>
            <div className="col-9">
                <a href='/' ><img src={logo} style={styles.logo} alt="logo" /></a>
                <div style={styles.title}>VanWrangler</div>
            </div>
            { typeof props.setToken === 'function' && <div className="col-3">
                <div style={styles.logout}>
                    <Link style={styles.profile}
                        to={{
                            pathname: '/profile',
                            state: {
                                custId: props.custId
                            }
                        }}><span>{props.email}</span></Link>
                    <FontAwesomeIcon icon={faSignOutAlt} onClick={logout} style={styles.logoutIcon} />
                </div>
            </div>}
        </div>
    );
}

