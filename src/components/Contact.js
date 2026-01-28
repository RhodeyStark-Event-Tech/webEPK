import { useState, useCallback } from 'react';
import './Contact.css';

const initialFormState = {
  name: '',
  email: '',
  phone: '',
  eventType: '',
  message: ''
};

const Contact = () => {
  const [formData, setFormData] = useState(initialFormState);

  const handleChange = useCallback(({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your inquiry! We will get back to you soon.');
    setFormData(initialFormState);
  };

  const contactInfo = [
    { title: 'Email', lines: ['bookings@servicepromo.com'] },
    { title: 'Phone', lines: ['(555) 123-4567'] },
    { title: 'Hours', lines: ['Monday - Friday: 9am - 6pm', 'Saturday: 10am - 4pm'] },
    { title: 'Location', lines: ['123 Entertainment Blvd', 'Suite 100', 'Los Angeles, CA 90001'] }
  ];

  return (
    <section
      id="contact"
      className="contact-section"
      role="region"
      aria-labelledby="contact-heading"
    >
      <div className="contact-container">
        <h2 id="contact-heading">Contact Us</h2>
        <p className="contact-intro" id="contact-description">
          Ready to book? Have questions? We'd love to hear from you!
        </p>
        <div className="contact-content">
          <aside
            className="contact-info"
            role="complementary"
            aria-label="Contact information"
          >
            {contactInfo.map(({ title, lines }) => (
              <address key={title} className="info-item">
                <h3>{title}</h3>
                {lines.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </address>
            ))}
          </aside>
          <form
            className="contact-form"
            onSubmit={handleSubmit}
            aria-labelledby="contact-heading"
            aria-describedby="contact-description"
            noValidate
          >
            <div className="form-group">
              <label htmlFor="name">
                Name <span aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                aria-required="true"
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">
                Email <span aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                aria-required="true"
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>
            <div className="form-group">
              <label htmlFor="eventType">Event Type</label>
              <select
                id="eventType"
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                aria-describedby="eventType-help"
              >
                <option value="">Select an event type</option>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate Event</option>
                <option value="private">Private Party</option>
                <option value="festival">Festival/Concert</option>
                <option value="other">Other</option>
              </select>
              <span id="eventType-help" className="sr-only">
                Choose the type of event you are planning
              </span>
            </div>
            <div className="form-group">
              <label htmlFor="message">
                Message <span aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                aria-required="true"
              />
            </div>
            <button type="submit" className="submit-btn">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
