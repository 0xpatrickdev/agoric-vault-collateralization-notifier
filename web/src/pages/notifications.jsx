import Empty from "../components/empty";

const Notifications = () => {
  return (
    <Empty
      title="No Notifications"
      description="Sign in with email to get started."
      graphic="notification"
      buttonText="Sign In"
      onClick={() => console.log("login!")}
    />
  );
};

export default Notifications;
