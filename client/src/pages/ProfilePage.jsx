import { useState } from 'react';
import Alert from '../components/molecules/Alert/index.js';
import AsyncContent from '../components/molecules/AsyncContent/index.js';
import Card from '../components/molecules/Card/index.js';
import ProfileDetailsCard from '../components/organisms/ProfileDetailsCard/index.js';
import ProfileEditForm from '../components/organisms/ProfileEditForm/index.js';
import MainTemplate from '../components/templates/MainTemplate/index.js';
import { useDemoSession } from '../contexts/demoSession.js';
import useProfile from '../hooks/useProfile.js';

// Keyed by the session epoch so unsaved edits, errors, and the success message
// are discarded on sign-out, account switch, scenario switch, and demo reset.
export default function ProfilePage() {
  const { sessionEpoch } = useDemoSession();
  return <ProfileContent key={sessionEpoch} />;
}

function ProfileContent() {
  const profile = useProfile();
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState('');

  async function save(values) {
    setSuccess('');
    const result = await profile.save(values);
    if (result.ok) {
      setEditing(false);
      setSuccess('Thông tin hồ sơ đã được cập nhật.');
    }
    return result;
  }

  return (
    <MainTemplate
      eyebrow="Tài khoản ClubFlow"
      title="Hồ sơ cá nhân"
      description="Xem thông tin tài khoản và cập nhật họ tên, email qua dịch vụ ClubFlow."
    >
      <AsyncContent status={profile.status} error={profile.error} onRetry={profile.reload}>
        {profile.data ? (
          <div className="stack stack--roomy">
            {success ? (
              <Alert tone="success" title="Đã lưu thay đổi" live>
                <p>{success}</p>
              </Alert>
            ) : null}
            {editing ? (
              <ProfileEditForm
                profile={profile.data}
                saving={profile.saving}
                serviceError={profile.saveError}
                onSave={save}
                onCancel={() => {
                  profile.clearSaveError();
                  setEditing(false);
                }}
              />
            ) : (
              <ProfileDetailsCard
                profile={profile.data}
                onEdit={() => {
                  setSuccess('');
                  profile.clearSaveError();
                  setEditing(true);
                }}
              />
            )}
            <Card title="Bảo mật tài khoản">
              <p>
                Quản lý mật khẩu nằm ngoài phạm vi PA#3. Phiên đăng nhập dùng bearer token chỉ trong tab hiện tại và không
                lưu mật khẩu trong trình duyệt.
              </p>
            </Card>
          </div>
        ) : null}
      </AsyncContent>
    </MainTemplate>
  );
}
