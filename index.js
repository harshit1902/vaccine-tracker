const request = require("request-promise");
const nodemailer = require("nodemailer");
require("dotenv").config();

function runCron(districtId) {
  setInterval(async () => {
    let d = new Date();
    let date = d.getDate() + 1;
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    date = `${date}-0${month}-${year}`;
    try {
      let res = await request({
        uri: `https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=${districtId}&date=${date}`,
      });
      let data = JSON.parse(res);
      let centers = data.centers;
      centers.forEach((center) => {
        center.sessions.forEach((session) => {
          if (session.available_capacity > 0) {
            sendEmail(
              center.name,
              center.address,
              center.state_name,
              center.district_name,
              center.pincode,
              center.from,
              center.to,
              center.fee_type,
              session.available_capacity,
              session.min_age_limit,
              session.vaccine,
              session.available_capacity_dose1,
              session.available_capacity_dose2
            );
          }
        });
      });
      console.log(
        "Updated for Date ",
        date,
        " today at ",
        d.toLocaleTimeString()
      );
    } catch (e) {
      console.log("ERROR", e);
    }
  }, 60000);
}

async function sendEmail(
  name,
  address,
  state,
  district,
  pincode,
  from,
  to,
  fees,
  available,
  minAge,
  vaccine,
  dose1,
  dose2
) {
  const senderEmail = process.env.SENDERS_EMAIL;
  const senderPassword = process.env.SENDERS_PASSWORD;
  const senderName = process.env.SENDERS_NAME;
  const receiverEmail = process.env.RECEIVERS_EMAIL;
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: senderEmail,
      pass: senderPassword,
    },
  });

  let info = await transporter.sendMail({
    from: `${senderName} <${senderEmail}>`,
    to: receiverEmail,
    subject: "Vaccine available",
    html: `
    <h1>Vaccine available</h1>

    <h3 style="display: inline;">Name</h3> : <p style="display: inline;">${name}</p><br/>

    <h3 style="display: inline;">Address</h3> : <p style="display: inline;">${address}</p><br/>
    
    <h3 style="display: inline;">State</h3> : <p style="display: inline;">${state}</p><br/>
    
    <h3 style="display: inline;">District</h3> : <p style="display: inline;">${district}</p><br/>

    <h3 style="display: inline;">Pincode</h3> : <p style="display: inline;">${pincode}</p><br/>
   
    <h3 style="display: inline;">Time</h3> : <p style="display: inline;">${from}</p><strong> to </strong>
    <p style="display: inline;">${to}</p><br/>

    <h3 style="display: inline;">Fees</h3> : <p style="display: inline;">${fees}</p><br/>
    
    <h3 style="display: inline;">Min Age</h3> : <p style="display: inline;">${minAge}</p><br/>
    
    <h3 style="display: inline;">Total Dose</h3> : <p style="display: inline;">${available}</p><br/>

    <h3 style="display: inline;">vaccine</h3> : <p style="display: inline;">${vaccine}</p><br/>
    
    <h3 style="display: inline;">Dose1</h3> : <p style="display: inline;">${dose1}</p><br/>

    <h3 style="display: inline;">Dose2</h3> : <p style="display: inline;">${dose2}</p><br/>`,
  });
  let d = new Date();
  console.log(
    "Mail send to ",
    receiverEmail,
    " today at ",
    d.toLocaleTimeString()
  );
}
// change the district ID here
// 505 for Jaipur I
// 506 for Jaipur II
// 512 for Alwar
runCron(505);
