export const metadata = {
  title: "404 Error",
};

export default function Error404() {
  return (
    <div>
      <h1>404 Error</h1>
      <h2>Oh no! you have encountered a page that does not exist!</h2>
      <h3>
        If you believe this is in error, please submit a{" "}
        <a href="https://7cav.us/tickets/categories/2/create">Ticket</a> to S6.
        Otherwise, please enjoy this sick music!
      </h3>
      <iframe
        title="Aliens"
        width="420"
        height="315"
        src="https://www.youtube.com/embed/4vkR1G_DUVc"
      />
    </div>
  );
}
