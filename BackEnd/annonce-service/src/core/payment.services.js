const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(req, res) {
  try {
    // On reçoit le montant en centimes depuis le front, ou on le fixe ici
    const { amount } = req.body; 

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Montant invalide" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, 
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Erreur Stripe:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createPaymentIntent };