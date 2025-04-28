import React from 'react';
import "./team.css";

const Team = () => {
  const Faculty = [
    {
      name: "Dr. Clayton Thyne",
      role: "University of Kentucky",
      image: "/images/ClaytonThyne.jpg",
      links: [
        { icon: "envelope", url: "mailto:clayton.thyne@uky.edu" },
        { icon: "globe", url: "https://polisci.as.uky.edu/users/clthyn2" }
      ]
    },
    {
      name: "Dr. Jonathan Powell",
      role: "University of Kentucky",
      image: "/images/JonathanPowell.jpg",
      links: [
        { icon: "envelope", url: "mailto:jonathan.powell@uky.edu" },
        { icon: "globe", url: "https://pattersonschool.uky.edu/people/jonathan-powell" }
      ]
    }
  ];

  const TEK = [
    {
      name: "Leah Smith",
      role: "Economics",
      image: "/images/Leah_Picture.png",
      links: [
        { icon: "envelope", url: "mailto:leah-smith22@outlook.com" },
        { icon: "linkedin", url: "https://www.linkedin.com/in/leah-smith-53175b359/" }
      ]
    },
    {
      name: "Kade Spaulding",
      role: "Mathematics",
      image: "/images/kade_picture.jpg",
      links: [
        { icon: "envelope", url: "mailto:kademarcus0908@gmail.com" },
        { icon: "linkedin", url: "https://www.linkedin.com/in/kade-spaulding-908621236/" }
      ]
    },
    {
      name: "Harrison Hill",
      role: "Mathematics",
      image: "/images/Harrison_Picture.png",
      links: [
        { icon: "envelope", url: "mailto:harryhill304@gmail.com" },
        { icon: "linkedin", url: "https://www.linkedin.com/in/harrison-c-hill/" }
      ]
    },
    {
      name: "Camila Pimentel",
      role: "Political Science | International Studies",
      image: "/images/Camila_picture.png",
      links: [
        { icon: "envelope", url: "mailto:camilatavarespimentel@gmail.com" },
        { icon: "linkedin", url: "https://www.linkedin.com/in/camila-pimentel-053608207/" }
      ]
    },
    {
      name: "Patricia Juarbe Rivera",
      role: "Public Policy | Economics",
      image: "/images/PatriciaJuarbe.jpg",
      links: [
        { icon: "envelope", url: "mailto:patriciajuarbe6@gmail.com" },
        { icon: "linkedin", url: "https://www.linkedin.com/in/particiajuarbe/" }
      ]
    },
    {
      name: "Jose Sequeira",
      role: "Computer Science",
      image: "/images/JoseSequeira.jpg",
      links: [
        { icon: "envelope", url: "mailto:jsequeirasanchez@gmail.com" },
        { icon: "linkedin", url: "https://www.linkedin.com/in/josequeira/" }
      ]
    },
    {
      name: "Morgan Blankenship",
      role: "Media Arts and Studies | Political Science",
      image: "/images/Morgan_picture.jpeg",
      links: [
        { icon: "envelope", url: "mailto: morganb20@hotmail.com" },
        { icon: "linkedin", url: "https://www.linkedin.com/in/morgan-blankenship-653740226/" }
      ]
    },
    {
      name: "Emma Thyne",
      role: "Political Science",
      image: "/images/EmmaThyne.jpg",
      links: [
        { icon: "envelope", url: "mailto:emma.thyne@outlook.com" },
        { icon: "linkedin", url: "https://www.linkedin.com/in/emma-thyne-462109205/" }
      ]
    }

  ];

  const CS = [
    {
      name: "Adrian Treadwell",
      role: "Computer Science",
      image: "/images/adriantreadwell.jpg",
      links: [
        { icon: "envelope", url: "mailto:astreadwell2@gmail.com" },
        { icon: "linkedin", url: "https://www.linkedin.com/in/astreadwell/" }
      ]
    },
    {
      name: "Alexander Young",
      role: "Computer Science",
      image: "/images/AlexanderYoung.jpg",
      links: [
        { icon: "envelope", url: "mailto:alexandersy04@gmail.com" },
        { icon: "linkedin", url: "https://www.linkedin.com/in/alexander-young-a37124224/" }
      ]
    },
    {
      name: "Logan Hester",
      role: "Computer Science",
      image: "/images/catWaraMeme.jpg",
      links: [
        { icon: "envelope", url: "mailto:sarah@uky.edu" },
        { icon: "linkedin", url: "#" }
      ]
    },
    {
      name: "Jose Sequeira",
      role: "Computer Science",
      image: "/images/JoseSequeira.jpg",
      links: [
        { icon: "envelope", url: "mailto:jsequeirasanchez@gmail.com" },
        { icon: "linkedin", url: "https://www.linkedin.com/in/josequeira/" }
      ]
    }
  ];

  return (

    <div className="team-container">
      {/* Page Title */}
      <h1 className="team-header">Meet the Team</h1>

      {/* TEK Team Section */}
      <div className="team-section">
        <h1 className="team-title">TEK Students</h1>
        <div className="team-grid">
          {TEK.map((member, index) => (
            <div className="team-card" key={`tek-${index}`}>
              <div className="card-header">
                <img src={member.image} alt={member.name} className="member-photo" />
                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                </div>
              </div>
              <p className="member-bio">{member.bio}</p>
              <div className="social-links">
                {member.links.map((link, idx) => (
                  <a 
                    key={idx} 
                    href={link.url} 
                    className={`social-link ${link.icon}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <i className={`fa${link.icon === 'envelope' ? 's' : 'b'} fa-${link.icon}`}></i>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CS Team Section */}
      <div className="team-section">
        <h1 className="team-title">Computer Science Students</h1>
        <div className="team-grid">
          {CS.map((member, index) => (
            <div className="team-card" key={`cs-${index}`}>
              <div className="card-header">
                <img src={member.image} alt={member.name} className="member-photo" />
                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                </div>
              </div>
              <p className="member-bio">{member.bio}</p>
              <div className="social-links">
                {member.links.map((link, idx) => (
                  <a 
                    key={idx} 
                    href={link.url} 
                    className={`social-link ${link.icon}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <i className={`fa${link.icon === 'envelope' ? 's' : 'b'} fa-${link.icon}`}></i>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Faculty Section */}
      <div className="team-section">
        <h1 className="team-title">Faculty</h1>
        <div className="team-grid">
          {Faculty.map((member, index) => (
            <div className="team-card" key={`tek-${index}`}>
              <div className="card-header">
                <img src={member.image} alt={member.name} className="member-photo" />
                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                </div>
              </div>
              <p className="member-bio">{member.bio}</p>
              <div className="social-links">
                {member.links.map((link, idx) => (
                  <a 
                    key={idx} 
                    href={link.url} 
                    className={`social-link ${link.icon}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <i className={`fa${['envelope', 'globe'].includes(link.icon) ? 's' : 'b'} fa-${link.icon}`}></i>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;