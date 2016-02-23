import Icon from './Icon';
// import FormGroup from './FormGroup';

class FormControlFeedback extends Icon {
  constructor() {
    super();
    this.cssClasses.system.feedback = 'form-control-feedback';
    this.attributes['aria-hidden'] = true;
  }

  canBeDroppedIn(component) {
    const FormGroup = require('./FormGroup').default;
    return super.canBeDroppedIn(component) && component instanceof FormGroup;
  }
}

FormControlFeedback.prettyName = 'Form Control Feedback';

export default FormControlFeedback;
