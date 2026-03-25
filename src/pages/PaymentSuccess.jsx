import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="glass rounded-2xl p-8 max-w-lg text-center">
        <CheckCircle2 size={52} className="text-green-400 mx-auto mb-4" />
        <h1 className="text-3xl font-display font-bold text-foreground mb-3">Payment Successful</h1>
        <p className="text-text-muted font-body mb-6">
          Your payment was received successfully. The dashboard will reflect the updated status after the backend webhook confirms the transaction.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/admin" className="btn-gold px-6 py-3 text-sm">
            Go to Dashboard
          </Link>
          <Link to="/" className="glass px-6 py-3 text-sm text-foreground rounded-xl">
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
