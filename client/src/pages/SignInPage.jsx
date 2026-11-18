import { Navigate, useLocation } from 'react-router-dom';
import Button from '../components/atoms/Button/index.js';
import SignInForm from '../components/organisms/SignInForm/index.js';
import MainTemplate from '../components/templates/MainTemplate/index.js';
import { useDemoSession } from '../contexts/demoSession.js';
import useSignIn from '../hooks/useSignIn.js';
import { postSignInDestination } from '../routes/navigation.js';
import { ROUTES } from '../routes/paths.js';

export default function SignInPage() {
  const { account, role, status } = useDemoSession();
  const location = useLocation();
  const auth = useSignIn();

  if (status === 'loading') {
    return null;
  }

  // Signed-in users never see the form: they go to the role-safe intended route
  // (after a successful sign-in) or to their role home (when opening /login).
  if (account) {
    return <Navigate to={postSignInDestination(role, location.state?.from)} replace />;
  }

  function handleSubmit(values) {
    auth.clearError();
    return auth.signIn(values);
  }

  return (
    <MainTemplate
      eyebrow="ClubFlow · Tài khoản được cấp sẵn"
      title="Đăng nhập"
      description="Đăng nhập để tiếp tục vào khu vực phù hợp với vai trò của bạn."
      actions={
        <Button to={ROUTES.HOME} variant="secondary">
          Quay về trang tuyển dụng
        </Button>
      }
    >
      <SignInForm
        onSubmit={handleSubmit}
        pending={auth.pending}
        serviceError={auth.error}
        examples={auth.credentials.data ?? []}
      />
    </MainTemplate>
  );
}
