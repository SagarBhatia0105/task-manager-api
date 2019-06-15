const sgMail = require('@sendgrid/mail')

//sendgrid is a service that is used to send emails
//and it can be integrated in the application development
//with the help of the API key

sgMail.setApiKey (process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  console.log("in the function");
  sgMail.send({
    to: email,
    from: 'sagar101283cse@gmail.com',
    subject: 'Welcome to Task-Manager',
    //back ticks are the ES6 version string template
    //to inject variables
    text: `Welcome to the app, ${name}. Thanks for joining in.`,
    //to add the html features
  })
}

const sendCancellationEmail = (email, name) =>{
  sgMail.send({
    to: email,
    from: 'sagar101283cse@gmail.com',
    subject: 'Cancellation confirmation',
    text: `Sorry to hear ${name} that you have to cancel our sevice. Please let use know how can we improve.`
  })
}

//the reason for exporting the object is to
//export multiple functions
module.exports = {
  //ES6 shorthand syntax
  sendWelcomeEmail,
  sendCancellationEmail
}
