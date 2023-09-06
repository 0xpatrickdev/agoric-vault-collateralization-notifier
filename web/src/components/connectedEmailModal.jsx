import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmailModal } from "../components/emailModal";
import { useAuth } from "../hooks/auth";

const ConnectedEmailModal = ({ visible, setIsVisible }) => {
  const [validationError, setValidationError] = useState(undefined);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (email) => {
    try {
      await register(email);
      navigate("/verification-sent");
    } catch (error) {
      setValidationError(error.message);
    }
  };

  return (
    <EmailModal
      handleSubmit={handleRegister}
      visible={visible}
      setIsVisible={setIsVisible}
      validationError={validationError}
      onFocus={() => setValidationError(undefined)}
    />
  );
};

export { ConnectedEmailModal };
