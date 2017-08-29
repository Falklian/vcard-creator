var { transliterate } = require('transliteration')
var substr = require('locutus/php/strings/substr')
var chunk_split = require('locutus/php/strings/chunk_split')

class vCard {
  constructor() {
    /**
     * definedElements
     *
     * @var array
     */
    this.definedElements = []
    /**
     * Filename
     *
     * @var string
     */
    this.filename = ''
    /**
     * Save Path
     *
     * @var string
     */
    this.savePath = null
    /**
     * Multiple properties for element allowed
     *
     * @var array
     */
    this.multiplePropertiesForElementAllowed = [
      'email',
      'address',
      'phoneNumber',
      'url'
    ]
    /**
     * Properties
     *
     * @var array
     */
    this.properties = []
    /**
     * Default Charset
     *
     * @var string
     */
    this.charset = 'utf-8'
  }

  /**
   * Add address
   *
   * @param  string [optional] name
   * @param  string [optional] extended
   * @param  string [optional] street
   * @param  string [optional] city
   * @param  string [optional] region
   * @param  string [optional] zip
   * @param  string [optional] country
   * @param  string [optional] type
   * type may be DOM | INTL | POSTAL | PARCEL | HOME | WORK
   * or any combination of these: e.g. "WORK;PARCEL;POSTAL"
   * @return this
   */
  addAddress(
      name = '',
      extended = '',
      street = '',
      city = '',
      region = '',
      zip = '',
      country = '',
      type = 'WORK;POSTAL'
  ) {
      // init value
      var value = name + ';' + extended + ';' + street + ';' + city + ';' + region + ';' + zip + ';' + country
      // set property
      this.setProperty(
          'address',
          'ADR' + ((type != '') ? ';' + type : '') + this.getCharsetString(),
          value
      )
      return this
  }

  /**
   * Add birthday
   *
   * @param  string date Format is YYYY-MM-DD
   * @return this
   */
  addBirthday(date)
  {
      this.setProperty(
          'birthday',
          'BDAY',
          date
      )
      return this
  }

  /**
   * Add company
   *
   * @param string company
   * @param string department
   * @return this
   */
  addCompany(company, department = '')
  {
      this.setProperty(
          'company',
          'ORG' + this.getCharsetString(),
          company
          + (department != '' ? ';' + department : '')
      );
      // if filename is empty, add to filename
      if (this.filename === null) {
          this.setFilename(company)
      }
      return this
  }

  /**
   * Add email
   *
   * @param  string address The e-mail address
   * @param  string [optional] type
   * The type of the email address
   * type may be  PREF | WORK | HOME
   * or any combination of these: e.g. "PREF;WORK"
   * @return this
   */
  addEmail(address, type = '')
  {
      this.setProperty(
          'email',
          'EMAIL;INTERNET' + ((type != '') ? ';' + type : ''),
          address
      )
      return this
  }

  /**
   * Add jobtitle
   *
   * @param  string jobtitle The jobtitle for the person.
   * @return this
   */
  addJobtitle(jobtitle)
  {
      this.setProperty(
          'jobtitle',
          'TITLE' + this.getCharsetString(),
          jobtitle
      )
      return this
  }

  /**
   * Add role
   *
   * @param  string role The role for the person.
   * @return this
   */
  addRole(role)
  {
      this.setProperty(
          'role',
          'ROLE' + this.getCharsetString(),
          role
      )
      return this
  }

  /**
   * Add a photo or logo (depending on property name)
   *
   * @param string property LOGO|PHOTO
   * @param string url image url or filename
   * @param bool include Do we include the image in our vcard or not?
   * @param string element The name of the element to set
   */
  addMedia(property, url, include = true, element)
  {
    return this
  }

  /**
   * Add name
   *
   * @param  string [optional] lastName
   * @param  string [optional] firstName
   * @param  string [optional] additional
   * @param  string [optional] prefix
   * @param  string [optional] suffix
   * @return this
   */
  addName(
      lastName = '',
      firstName = '',
      additional = '',
      prefix = '',
      suffix = ''
  ) {
      // define values with non-empty values
      var values = [
          prefix,
          firstName,
          additional,
          lastName,
          suffix,
      ].filter(m => !!m)
      // define filename
      this.setFilename(values)
      // set property
      var property = lastName + ';' + firstName + ';' + additional + ';' + prefix + ';' + suffix
      this.setProperty(
          'name',
          'N' + this.getCharsetString(),
          property
      )
      // is property FN set?
      if (!this.hasProperty('FN')) {
          // set property
          this.setProperty(
              'fullname',
              'FN' + this.getCharsetString(),
              values.join(' ').trim()
          )
      }
      return this
  }

  /**
   * Add note
   *
   * @param  string note
   * @return this
   */
  addNote(note)
  {
      this.setProperty(
          'note',
          'NOTE' + this.getCharsetString(),
          note
      )
      return this
  }

  /**
   * Add categories
   *
   * @param array categories
   * @return this
   */
  addCategories(categories)
  {
      this.setProperty(
          'categories',
          'CATEGORIES' + this.getCharsetString(),
          categories.join(',').trim()
      )
      return this
  }

  /**
   * Add phone number
   *
   * @param  string number
   * @param  string [optional] type
   * Type may be PREF | WORK | HOME | VOICE | FAX | MSG |
   * CELL | PAGER | BBS | CAR | MODEM | ISDN | VIDEO
   * or any senseful combination, e.g. "PREF;WORK;VOICE"
   * @return this
   */
  addPhoneNumber(number, type = '')
  {
      this.setProperty(
          'phoneNumber',
          'TEL' + ((type != '') ? ';' + type : ''),
          number
      )
      return this
  }

  /**
   * Add Logo
   *
   * @param  string url image url or filename
   * @param  bool include Include the image in our vcard?
   * @return this
   */
  addLogo(url, include = true)
  {
      this.addMedia(
          'LOGO',
          url,
          include,
          'logo'
      )
      return this
  }

  /**
  * Add Photo
  *
  * @param  string url image url or filename
  * @param  bool include Include the image in our vcard?
  * @return this
  */
  addPhoto(url, include = true)
  {
      this.addMedia(
          'PHOTO',
          url,
          include,
          'photo'
      )
      return this
  }

  /**
   * Add URL
   *
   * @param  string url
   * @param  string [optional] type Type may be WORK | HOME
   * @return this
   */
  addURL(url, type = '')
  {
      this.setProperty(
          'url',
          'URL' + ((type != '') ? ';' + type : ''),
          url
      )
      return this
  }

  /**
   * Build vCard (.vcf)
   *
   * @return string
   */
  buildVCard()
  {
      // init string
      var now = new Date()
      var string = ""
      string += "BEGIN:VCARD\r\n"
      string += "VERSION:3.0\r\n"
      string += "REV:" + now.toISOString() + "\r\n"
      // loop all properties
      var properties = this.getProperties()
      properties.forEach(property => {
          // add to string
          string += this.fold(property['key'] + ':' + this.escape(property['value']) + "\r\n")
      })
      // add to string
      string += "END:VCARD\r\n"
      // return
      return string
  }


  /**
   * Build VCalender (.ics) - Safari (< iOS 8) can not open .vcf files, so we have build a workaround.
   *
   * @return string
   */
  buildVCalendar()
  {
      return ''
  }

  /**
   * Returns the browser user agent string.
   *
   * @return string
   */
  getUserAgent()
  {
      var browser = 'unknown'
      if (navigator && navigator.userAgent) {
          browser = navigator.userAgent
      }
      return browser
  }

  /**
   * Decode
   *
   * @param  string value The value to decode
   * @return string decoded
   */
  decode(value)
  {
      // convert cyrlic, greek or other caracters to ASCII characters
      return transliterate(value)
  }

  /**
   * Download a vcard or vcal file to the browser.
   */
  download()
  {
      // define output
      var output = this.getOutput()
      // echo the output and it will be a download
      console.log(output)
  }

  /**
   * Fold a line according to RFC2425 section 5.8.1.
   *
   * @link http://tools.ietf.org/html/rfc2425#section-5.8.1
   * @param  string text
   * @return mixed
   */
  fold(text)
  {
      if (text.length <= 75) {
          return text
      }
      // split, wrap and trim trailing separator
      return substr(chunk_split(text, 73, "\r\n "), 0, -3)
  }

  /**
   * Escape newline characters according to RFC2425 section 5.8.4.
   *
   * @link http://tools.ietf.org/html/rfc2425#section-5.8.4
   * @param  string text
   * @return string
   */
  escape(text)
  {
      var escapedText = ('' + text).replace("\r\n", "\\n")
      escapedText = escapedText.replace("\n", "\\n")
      return escapedText
  }

  /**
   * Get output as string
   * @deprecated in the future
   *
   * @return string
   */
  toString()
  {
      return this.getOutput()
  }

  /**
   * Get charset
   *
   * @return string
   */
  getCharset()
  {
      return this.charset
  }

  /**
   * Get charset string
   *
   * @return string
   */
  getCharsetString()
  {
      var charsetString = ''
      if (this.charset == 'utf-8') {
          charsetString = ';CHARSET=' + this.charset
      }
      return charsetString
  }

  /**
   * Get content type
   *
   * @return string
   */
  getContentType()
  {
      return (this.isIOS7()) ? 'text/x-vcalendar' : 'text/x-vcard'
  }

  /**
   * Get filename
   *
   * @return string
   */
  getFilename()
  {
      if (!this.filename) {
          return 'unknown'
      }
      return this.filename
  }

  /**
   * Get file extension
   *
   * @return string
   */
  getFileExtension()
  {
      return (this.isIOS7()) ? 'ics' : 'vcf'
  }

  /**
   * Get headers
   *
   * @param  bool asAssociative
   * @return array
   */
  getHeaders($asAssociative)
  {
    return []
  }

  /**
   * Get output as string
   * iOS devices (and safari < iOS 8 in particular) can not read .vcf (= vcard) files.
   * So I build a workaround to build a .ics (= vcalender) file.
   *
   * @return string
   */
  getOutput()
  {
      var output = (this.isIOS7()) ? this.buildVCalendar() : this.buildVCard()
      return output
  }

  /**
   * Get properties
   *
   * @return array
   */
  getProperties()
  {
      return this.properties
  }

  /**
   * Has property
   *
   * @param  string key
   * @return bool
   */
  hasProperty(key)
  {
      var pproperties = this.getProperties()
      pproperties.forEach(property => {
        if (property['key'] === key && property['value'] !== '') {
            return true
        }
      })
      return false
  }

  /**
   * Is iOS - Check if the user is using an iOS-device
   *
   * @return bool
   */
  isIOS()
  {
      return false
  }

  /**
   * Is iOS less than 7 (should cal wrapper be returned)
   *
   * @return bool
   */
  isIOS7()
  {
      return false
  }

  /**
   * Save to a file
   *
   * @return void
   */
  save()
  {
      return
  }

  /**
   * Set charset
   *
   * @param  mixed charset
   * @return void
   */
  setCharset(charset)
  {
      this.charset = charset
  }

  /**
   * Set filename
   *
   * @param  mixed value
   * @param  bool overwrite [optional] Default overwrite is true
   * @param  string separator [optional] Default separator is an underscore '_'
   * @return void
   */
  setFilename(value, overwrite = true, separator = '_')
  {
    this.filename = 'file'
  }

  /**
   * Set the save path directory
   *
   * @param  string savePath Save Path
   * @throws VCardException
   */
  setSavePath(savePath)
  {
    return
  }

  /**
   * Set property
   *
   * @param  string element The element name you want to set, f.e.: name, email, phoneNumber, ...
   * @param  string key
   * @param  string value
   * @throws VCardException
   */
  setProperty(element, key, value)
  {
      if (this.multiplePropertiesForElementAllowed.indexOf(element) < 0
          && this.definedElements[element]
      ) {
          throw 'This element already exists (' + element + ')'
      }
      // we define that we set this element
      this.definedElements[element] = true
      // adding property
      this.properties.push({
          'key': key,
          'value': value
      })
  }

  /**
   * Checks if we should return vcard in cal wrapper
   *
   * @return bool
   */
  shouldAttachmentBeCal()
  {
      return false
  }
}

exports.vCard = vCard