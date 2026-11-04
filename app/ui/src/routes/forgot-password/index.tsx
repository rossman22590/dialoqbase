import { QueryBoundaries } from "../../components/Common/QueryBoundaries";
import { AuthForgotPassword } from "../../components/Auth/ForgotPassword";

export default function ForgotPasswordRoot() {
  return (
    <QueryBoundaries>
      <AuthForgotPassword />
    </QueryBoundaries>
  );
}
