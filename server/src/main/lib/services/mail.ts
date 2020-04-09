import config from 'config'
import nodemailer from 'nodemailer'

export async function send (fields: { to:string, subject:string, text:string }):Promise<any> {
  var transport = nodemailer.createTransport({
    host: config.get('mail.host'),
    port: config.get('mail.port'),
    auth: {
      user: config.get('mail.username'),
      pass: config.get('mail.password')
    }
  })

  try {
    const info = await transport.sendMail({
      from: config.get('mail.from'),
      to: fields.to,
      subject: fields.subject,
      text: fields.text,
      html: fields.text
    })

    return info
  } catch (err) {
    throw err
  }
}


