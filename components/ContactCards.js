const contacts = [
  { name: "Deepak Thapar", phone: "+91 95947 87000", email: "deepakt@eigroup.in", photo: "/images/deepak-thapar-profile-pic.jpg" },
  { name: "Bhawna Khanna", phone: "+91 92205 03997", email: "bhawnak@eigroup.in", photo: "/images/bhawna-khanna-profile-pic.jpg" },
];

export default function ContactCards() {
  return (
    <section className="section-padding">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="exhibitor-heading-left">For additional information, please contact:</div>
          </div>
        </div>

        <div className="row">
          {contacts.map((contact) => (
            <div className="col-md-4" key={contact.name}>
              <div className="profile-pic-exhibitor-main">
                <div className="pramit-kumar-profile-pic">
                  <img src={contact.photo} alt={contact.name} />
                </div>
              </div>
              <div className="profile-pic-exhibitor-details">
                <div className="exhibitor-profile-name-heading">{contact.name}</div>
                <div className="exhibitor-profile-position">
                  <ul>
                    <li>{contact.phone}</li>
                    <li>
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
