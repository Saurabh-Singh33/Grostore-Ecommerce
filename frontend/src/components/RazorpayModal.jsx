import { useState } from "react";
import "./RazorpayModal.css";

const TABS = ["Card", "NetBanking", "UPI", "Wallet"];

const BANKS = [
  { name: "HDFC Bank", logo: "🏦" },
  { name: "SBI", logo: "🏛️" },
  { name: "ICICI Bank", logo: "💼" },
  { name: "Axis Bank", logo: "🏢" },
  { name: "Kotak Bank", logo: "🏦" },
  { name: "Yes Bank", logo: "🏦" },
];

const RazorpayModal = ({ amount, onSuccess, onClose }) => {
  const [tab, setTab] = useState("Card");
  const [step, setStep] = useState("form"); // form | otp | processing | done
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [upi, setUpi] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
  const [errors, setErrors] = useState({});

  const formatCard = (val) =>
    val.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);

  const formatExpiry = (val) =>
    val.replace(/\D/g, "").replace(/^(.{2})(.*)/, "$1/$2").slice(0, 5);

  const validateCard = () => {
    const e = {};
    if (!card.number || card.number.replace(/\s/g, "").length < 16) e.number = "Enter a valid 16-digit card number";
    if (!card.name.trim()) e.name = "Cardholder name is required";
    if (!card.expiry || card.expiry.length < 5) e.expiry = "Enter a valid expiry (MM/YY)";
    if (!card.cvv || card.cvv.length < 3) e.cvv = "Enter a valid CVV";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    if (tab === "Card" && !validateCard()) return;
    if (tab === "UPI" && !upi.includes("@")) {
      setErrors({ upi: "Enter a valid UPI ID (e.g. name@upi)" });
      return;
    }
    if (tab === "NetBanking" && !selectedBank) {
      setErrors({ bank: "Please select a bank" });
      return;
    }
    setErrors({});
    setStep("otp");
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) {
      setErrors({ otp: "Enter the OTP sent to your registered number" });
      return;
    }
    setErrors({});
    setStep("processing");
    setTimeout(() => {
      setStep("done");
      setTimeout(onSuccess, 1500);
    }, 2000);
  };

  return (
    <div className="rzp-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rzp-modal">
        {/* Header */}
        <div className="rzp-header">
          <div className="rzp-header__left">
            <div className="rzp-logo">
              <span className="rzp-logo__mark">R</span>
              <span className="rzp-logo__text">razorpay</span>
            </div>
            <div className="rzp-merchant">Grostore</div>
          </div>
          <div className="rzp-header__amount">
            <span className="rzp-amount-label">Pay</span>
            <span className="rzp-amount-value">₹{amount?.toLocaleString("en-IN")}</span>
          </div>
          <button className="rzp-close" onClick={onClose}>✕</button>
        </div>

        <div className="rzp-body">
          {/* Processing / Done overlays */}
          {step === "processing" && (
            <div className="rzp-overlay">
              <div className="rzp-spinner" />
              <p>Processing payment…</p>
            </div>
          )}
          {step === "done" && (
            <div className="rzp-overlay rzp-overlay--success">
              <div className="rzp-success-icon">✓</div>
              <p>Payment Successful!</p>
            </div>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <div className="rzp-otp-screen">
              <div className="rzp-otp-icon">📱</div>
              <h3>OTP Verification</h3>
              <p className="rzp-otp-desc">
                An OTP has been sent to your registered mobile number ending with <strong>**67</strong>
              </p>
              <input
                className={`rzp-otp-input ${errors.otp ? "error" : ""}`}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
              {errors.otp && <p className="rzp-error">{errors.otp}</p>}
              <p className="rzp-resend">Didn't receive? <button className="rzp-link">Resend OTP</button></p>
              <button className="rzp-pay-btn" onClick={handleVerifyOtp}>Verify & Pay</button>
            </div>
          )}

          {/* Main payment form */}
          {(step === "form") && (
            <>
              {/* Tabs */}
              <div className="rzp-tabs">
                {TABS.map((t) => (
                  <button
                    key={t}
                    className={`rzp-tab ${tab === t ? "active" : ""}`}
                    onClick={() => { setTab(t); setErrors({}); }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Card Tab */}
              {tab === "Card" && (
                <div className="rzp-form">
                  <div className="rzp-card-visual">
                    <div className="rzp-card-visual__chip" />
                    <div className="rzp-card-visual__number">
                      {card.number || "•••• •••• •••• ••••"}
                    </div>
                    <div className="rzp-card-visual__footer">
                      <span>{card.name || "CARD HOLDER"}</span>
                      <span>{card.expiry || "MM/YY"}</span>
                    </div>
                  </div>

                  <div className="rzp-field">
                    <label>Card Number</label>
                    <input
                      className={errors.number ? "error" : ""}
                      placeholder="4111 1111 1111 1111"
                      maxLength={19}
                      value={card.number}
                      onChange={(e) => setCard((c) => ({ ...c, number: formatCard(e.target.value) }))}
                    />
                    {errors.number && <p className="rzp-error">{errors.number}</p>}
                  </div>
                  <div className="rzp-field">
                    <label>Cardholder Name</label>
                    <input
                      className={errors.name ? "error" : ""}
                      placeholder="Name on card"
                      value={card.name}
                      onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                    />
                    {errors.name && <p className="rzp-error">{errors.name}</p>}
                  </div>
                  <div className="rzp-field-row">
                    <div className="rzp-field">
                      <label>Expiry Date</label>
                      <input
                        className={errors.expiry ? "error" : ""}
                        placeholder="MM/YY"
                        maxLength={5}
                        value={card.expiry}
                        onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                      />
                      {errors.expiry && <p className="rzp-error">{errors.expiry}</p>}
                    </div>
                    <div className="rzp-field">
                      <label>CVV</label>
                      <input
                        className={errors.cvv ? "error" : ""}
                        placeholder="•••"
                        maxLength={4}
                        type="password"
                        value={card.cvv}
                        onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "") }))}
                      />
                      {errors.cvv && <p className="rzp-error">{errors.cvv}</p>}
                    </div>
                  </div>
                  <button className="rzp-pay-btn" onClick={handlePay}>
                    Pay ₹{amount?.toLocaleString("en-IN")}
                  </button>
                </div>
              )}

              {/* NetBanking Tab */}
              {tab === "NetBanking" && (
                <div className="rzp-form">
                  {errors.bank && <p className="rzp-error">{errors.bank}</p>}
                  <div className="rzp-banks-grid">
                    {BANKS.map((b) => (
                      <button
                        key={b.name}
                        className={`rzp-bank-card ${selectedBank === b.name ? "active" : ""}`}
                        onClick={() => setSelectedBank(b.name)}
                      >
                        <span className="rzp-bank-logo">{b.logo}</span>
                        <span className="rzp-bank-name">{b.name}</span>
                      </button>
                    ))}
                  </div>
                  <button className="rzp-pay-btn" onClick={handlePay}>
                    Pay ₹{amount?.toLocaleString("en-IN")}
                  </button>
                </div>
              )}

              {/* UPI Tab */}
              {tab === "UPI" && (
                <div className="rzp-form">
                  <div className="rzp-upi-apps">
                    {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                      <button key={app} className="rzp-upi-app">{app}</button>
                    ))}
                  </div>
                  <div className="rzp-divider"><span>or enter UPI ID</span></div>
                  <div className="rzp-field">
                    <label>UPI ID</label>
                    <input
                      className={errors.upi ? "error" : ""}
                      placeholder="yourname@bank"
                      value={upi}
                      onChange={(e) => setUpi(e.target.value)}
                    />
                    {errors.upi && <p className="rzp-error">{errors.upi}</p>}
                  </div>
                  <button className="rzp-pay-btn" onClick={handlePay}>
                    Pay ₹{amount?.toLocaleString("en-IN")}
                  </button>
                </div>
              )}

              {/* Wallet Tab */}
              {tab === "Wallet" && (
                <div className="rzp-form">
                  <div className="rzp-banks-grid">
                    {["Paytm Wallet", "Amazon Pay", "Mobikwik", "Freecharge"].map((w) => (
                      <button
                        key={w}
                        className={`rzp-bank-card ${selectedBank === w ? "active" : ""}`}
                        onClick={() => setSelectedBank(w)}
                      >
                        <span className="rzp-bank-logo">💳</span>
                        <span className="rzp-bank-name">{w}</span>
                      </button>
                    ))}
                  </div>
                  <button className="rzp-pay-btn" onClick={handlePay}>
                    Pay ₹{amount?.toLocaleString("en-IN")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="rzp-footer">
          <span>🔒 Secured by</span>
          <span className="rzp-footer__brand">Razorpay</span>
        </div>
      </div>
    </div>
  );
};

export default RazorpayModal;
