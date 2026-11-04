import { QueryBoundaries } from "../../components/Common/QueryBoundaries";
import { AuthResetPassword } from "../../components/Auth/ResetPassword";

export default function ResetPasswordRoot() {
  return (
    <QueryBoundaries>
      <AuthResetPassword />
    </QueryBoundaries>
  );
}
