import request from 'request';
import _ from 'lodash';

import CONFIG from '../../config';
import { logger } from '../logger';

export const statusSMS = async (SMSID: string): Promise<{ succeeded: boolean; code: number }> => {
  if (CONFIG.SMS_SIMULATE) {
    return { succeeded: true, code: 1 };
  }

  const url = 'https://www.smsflatrate.net/status.php';

  const qs = {
    id: SMSID,
  };

  return new Promise<{ succeeded: boolean; code: number }>((resolve, reject) => {
    request({ url, qs }, (err, response, body) => {
      if (err) {
        logger.error(JSON.stringify(err));
        reject(err);
      }
      const code = parseInt(body, 10);
      switch (code) {
        case 100:
          // Standard Rückgabewert // Standard return value
          // SMS erfolgreich an das Gateway übertragen
          // SMS successfully transferred to the gateway
          resolve({ succeeded: true, code });
          break;
        // Zustellberichte / Return values (101-109)
        // Return values 101 - 109 for sms with status request only
        case 101:
          // SMS wurde zugestellt // SMS successfully dispatched
          resolve({ succeeded: true, code });
          break;
        case 102:
          // SMS wurde noch nicht zugestellt(z.B.Handy aus oder temporär nicht erreichbar)
          // SMS not delivered yet(for example mobile phone is off or network temporarily
          // unavailable)
          resolve({ succeeded: false, code });
          break;
        case 103:
          // SMS konnte vermutlich nicht zugestellt werden(Rufnummer falsch, SIM nicht aktiv)
          // SMS probably not delivered(wrong number, SIMcard not active)
          resolve({ succeeded: false, code });
          break;
        case 104:
          // SMS konnte nach Ablauf von 48 Stunden noch immer nicht zugestellt werden.
          // Aus dem Rückgabewert 102 wird nach Ablauf von 2 Tagen der Status 104.
          // SMS could not be delivered within 48 hours.
          // The return value 102 changes to 104 after the 48 hours have passed.
          resolve({ succeeded: false, code });
          break;
        case 109:
          // SMS ID abgelaufen oder ungültig(manuelle Status - Abfrage)
          // SMS ID expired or is invalid(for using manual status request)
          resolve({ succeeded: false, code });
          break;
        // Zusätzliche Rückgabewerte
        case 110:
          // Falscher Schnittstellen - Key oder Ihr Account ist gesperrt
          // Wrong Gateway - Key or your account is locked
          resolve({ succeeded: false, code });
          break;
        case 120:
          // Guthaben reicht nicht aus // Not enough credits
          resolve({ succeeded: false, code });
          break;
        case 130:
          // Falsche Datenübergabe(z.B.Absender fehlt)
          // Incorrect data transfer(for example the Sender - ID is missing)
          resolve({ succeeded: false, code });
          break;
        case 131:
          // Empfänger nicht korrekt // Receiver number is not correct
          resolve({ succeeded: false, code });
          break;
        case 132:
          // Absender nicht korrekt // Sender-ID is not correct
          resolve({ succeeded: false, code });
          break;
        case 133:
          // Nachrichtentext nicht korrekt // Text message not correct
          resolve({ succeeded: false, code });
          break;
        case 140:
          // Falscher AppKey oder Ihr Account ist gesperrt
          // Wrong AppKey or your account is locked
          resolve({ succeeded: false, code });
          break;
        case 150:
          // Sie haben versucht an eine internationale Handynummer eines Gateways, das
          // ausschließlich für den Versand nach Deutschland bestimmt ist, zu senden.
          // Bitte internationales Gateway oder Auto - Type - Funktion verwenden.
          // You have tried to send to an international phone number through a gateway determined to
          // handle german receivers only.Please use an international Gateway - Type or Auto - Type.
          resolve({ succeeded: false, code });
          break;
        case 170:
          // Parameter „time =“ ist nicht korrekt.Bitte im Format: TT.MM.JJJJ - SS: MM oder
          // Parameter entfernen für sofortigen Versand.
          // Parameter "time =" is not correct.Please use the format: TT.MM.YYYY - SS: MM or delete
          // parameter for immediately dispatch.
          resolve({ succeeded: false, code });
          break;
        case 171:
          // Parameter „time =“ ist zu weit in der Zukunft terminiert(max. 360 Tage)
          // Parameter "time =" is too far in the future(max. 360 days).
          resolve({ succeeded: false, code });
          break;
        case 180:
          // Account noch nicht komplett freigeschaltet / Volumen - Beschränkung noch aktiv
          // Bitte im Kundencenter die Freischaltung beantragen, damit unbeschränkter
          // Nachrichtenversand möglich ist.
          resolve({ succeeded: false, code });
          break;
        case 231:
          // Keine smsflatrate.net Gruppe vorhanden oder nicht korrekt
          // smsflatrate.net group is not available or not correct
          resolve({ succeeded: false, code });
          break;
        case 404:
          // Unbekannter Fehler.Bitte dringend Support(ticket@smsflatrate.net) kontaktieren.
          // Unknown error.Please urgently contact support(ticket@smsflatrate.net).
          resolve({ succeeded: false, code });
          break;
        default:
          resolve({ succeeded: false, code });
      }
    });
  });
};

export const sendSMS = async (
  phone: string,
  code: string,
): Promise<{
  status: boolean;
  statusCode: number;
  SMSID: string;
}> => {
  if (CONFIG.SMS_SIMULATE) {
    return { status: true, statusCode: 100, SMSID: _.uniqueId() };
  }
  const url = 'https://www.smsflatrate.net/schnittstelle.php';

  const qs = {
    key: CONFIG.SMS_PROVIDER_KEY,
    from: 'DEMOCRACY',
    to: phone,
    text: `Hallo von DEMOCRACY. Dein Code lautet: ${code}`,
    type: 'auto10or11',
    status: '1',
  };

  return new Promise((resolve, reject) => {
    request({ url, qs }, (err, response, body) => {
      let status = false;
      let statusCode = null;
      let SMSID = null;
      if (err) {
        reject(err);
      }
      const bodyResult = body.split(',');
      statusCode = parseInt(bodyResult[0], 10);
      SMSID = bodyResult[1]; // eslint-disable-line
      switch (statusCode) {
        case 100:
          // Standard Rückgabewert // Standard return value
          // SMS erfolgreich an das Gateway übertragen
          // SMS successfully transferred to the gateway
          status = true;
          break;
        // Zustellberichte / Return values (101-109)
        // Return values 101 - 109 for sms with status request only
        case 101:
          // SMS wurde zugestellt // SMS successfully dispatched
          status = true;
          break;
        case 102:
          // SMS wurde noch nicht zugestellt(z.B.Handy aus oder temporär nicht erreichbar)
          // SMS not delivered yet(for example mobile phone is off or network temporarily
          // unavailable)
          status = false;
          break;
        case 103:
          // SMS konnte vermutlich nicht zugestellt werden(Rufnummer falsch, SIM nicht aktiv)
          // SMS probably not delivered(wrong number, SIMcard not active)
          status = false;
          break;
        case 104:
          // SMS konnte nach Ablauf von 48 Stunden noch immer nicht zugestellt werden.
          // Aus dem Rückgabewert 102 wird nach Ablauf von 2 Tagen der Status 104.
          // SMS could not be delivered within 48 hours.
          // The return value 102 changes to 104 after the 48 hours have passed.
          status = false;
          break;
        case 109:
          // SMS ID abgelaufen oder ungültig(manuelle Status - Abfrage)
          // SMS ID expired or is invalid(for using manual status request)
          status = false;
          break;

        // Zusätzliche Rückgabewerte
        case 110:
          // Falscher Schnittstellen - Key oder Ihr Account ist gesperrt
          // Wrong Gateway - Key or your account is locked
          status = false;
          break;
        case 120:
          // Guthaben reicht nicht aus // Not enough credits
          status = false;
          break;
        case 130:
          // Falsche Datenübergabe(z.B.Absender fehlt)
          // Incorrect data transfer(for example the Sender - ID is missing)
          status = false;
          break;
        case 131:
          // Empfänger nicht korrekt // Receiver number is not correct
          status = false;
          break;
        case 132:
          // Absender nicht korrekt // Sender-ID is not correct
          status = false;
          break;
        case 133:
          // Nachrichtentext nicht korrekt // Text message not correct
          status = false;
          break;
        case 140:
          // Falscher AppKey oder Ihr Account ist gesperrt
          // Wrong AppKey or your account is locked
          status = false;
          break;
        case 150:
          // Sie haben versucht an eine internationale Handynummer eines Gateways, das
          // ausschließlich für den Versand nach Deutschland bestimmt ist, zu senden.
          // Bitte internationales Gateway oder Auto - Type - Funktion verwenden.
          // You have tried to send to an international phone number through a gateway determined to
          // handle german receivers only.Please use an international Gateway - Type or Auto - Type.
          status = false;
          break;
        case 170:
          // Parameter „time =“ ist nicht korrekt.Bitte im Format: TT.MM.JJJJ - SS: MM oder
          // Parameter entfernen für sofortigen Versand.
          // Parameter "time =" is not correct.Please use the format: TT.MM.YYYY - SS: MM or delete
          // parameter for immediately dispatch.
          status = false;
          break;
        case 171:
          // Parameter „time =“ ist zu weit in der Zukunft terminiert(max. 360 Tage)
          // Parameter "time =" is too far in the future(max. 360 days).
          status = false;
          break;
        case 180:
          // Account noch nicht komplett freigeschaltet / Volumen - Beschränkung noch aktiv
          // Bitte im Kundencenter die Freischaltung beantragen, damit unbeschränkter
          // Nachrichtenversand möglich ist.
          status = false;
          break;
        case 231:
          // Keine smsflatrate.net Gruppe vorhanden oder nicht korrekt
          // smsflatrate.net group is not available or not correct
          status = false;
          break;
        case 404:
          // Unbekannter Fehler.Bitte dringend Support(ticket@smsflatrate.net) kontaktieren.
          // Unknown error.Please urgently contact support(ticket@smsflatrate.net).
          status = false;
          break;
        default:
          status = false;
      }
      if (!status) {
        console.error('SMS Error', bodyResult);
      }
      resolve({ status, statusCode, SMSID });
    });
  });
};
