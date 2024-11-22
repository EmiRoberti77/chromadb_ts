function convertMobileNumber(
  locale: string,
  passengerPhone: string | null,
  leadPassengerPhone: string | null
): string {
  const phone = passengerPhone || leadPassengerPhone || '';

  if (!phone) {
    return '';
  }

  const prefix = phone.substring(0, 2);

  switch (locale) {
    case 'en_GB':
      if (prefix === '44') {
        return '+' + phone;
      } else if (prefix === '07') {
        return '+44' + phone.substring(1);
      }
      break;

    case 'fr_FR':
      if (prefix === '33') {
        return '+' + phone;
      }
      break;

    case 'de_DE':
      if (prefix === '49') {
        return '+' + phone;
      }
      break;

    case 'de_CH':
    case 'fr_CH':
      if (prefix === '41') {
        return '+' + phone;
      }
      break;

    default:
      return phone;
  }

  // Default case if none of the above match
  return phone;
}

const locale = 'en_GB';
const passengerPhone = null;
const leadPassengerPhone = '+447123456789jhhjhkjhjkhjkh';

const formattedNumber = convertMobileNumber(
  locale,
  passengerPhone,
  leadPassengerPhone
);
console.log(formattedNumber);
