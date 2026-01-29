import '../styles/RegisterStyle.css';
import Navbar from './Navbar';
import Footer from './Footer';

export default function mentionsLegales() {
    return (
        <>
        <Navbar />
        <div className="container-login100">
        <div className="wrap-login100"> 
            <span className="login100-form-title">
                Mentions légales
            </span>
            <div className="legal-content">
                <h2>Informations légales</h2>
                <p>Conformément aux dispositions des articles 6-III et 19 de la Loi n°2004-575 du 21 juin 2004 pour la Confiance dans l&apos;Économie Numérique, il est précisé aux utilisateurs du site les p&apos;tits vieux l&apos;identité des différents intervenants dans le cadre de sa réalisation et de son suivi :</p>
                
                <h3>Éditeur du site :</h3>
                <p>les p&apos;tits vieux</p>
                <p>Adresse : ...</p>
                <p>Email : discutePOTINS@2911.net</p>
            </div>
        </div>
        </div>
        <Footer />
    </>
    );
}