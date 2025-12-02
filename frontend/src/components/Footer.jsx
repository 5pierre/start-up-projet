import '../styles/RegisterStyle.css';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <Link to="/mentionsLegales" className='mentionsLegales'>
                    Mentions Légales
                </Link>
            </div>
        </footer>
    );
}