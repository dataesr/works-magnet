import { Icon } from '@dataesr/react-dsfr';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';

import './button.scss';
import Loader from './loader';

const iconSize = {
  sm: '1x',
  md: 'lg',
  lg: 'xl',
};

const Button = forwardRef((props, ref) => {
  const {
    size,
    secondary,
    tertiary,
    disabled,
    icon,
    iconPosition,
    children,
    className,
    submit,
    borderless,
    rounded,
    color,
    isLoading,
    ...remainingProps
  } = props;
  const _className = classNames(`fr-btn--${size} fr-btn`, className, {
    'btn-text': color === 'text',
    'btn-error': color === 'error',
    'btn-success': color === 'success',
    'btn-icon': !children && icon,
    'btn-primary': !secondary && !tertiary,
    'fr-btn--secondary': secondary,
    'fr-btn--tertiary': tertiary && !borderless,
    'fr-btn--tertiary-no-outline': borderless,
    'btn-icon--rounded': !children && icon && rounded,
    'btn--loading': isLoading,
  });

  const _button = (
    <button
      ref={ref}
      type={submit ? 'submit' : 'button'}
      className={_className}
      disabled={disabled}
      {...remainingProps}
    >
      <span>{children}</span>
      {isLoading && <Loader />}
    </button>
  );
  return icon ? (
    <Icon
      verticalAlign="sub"
      name={icon}
      size={iconSize[size]}
      iconPosition={(children && `${iconPosition}`) || 'center'}
    >
      {_button}
    </Icon>
  ) : (
    _button
  );
});

Button.defaultProps = {
  size: 'md',
  isLoading: false,
  secondary: false,
  disabled: false,
  iconPosition: 'left',
  icon: '',
  children: '',
  className: '',
  tertiary: false,
  submit: false,
  borderless: false,
  color: null,
  rounded: false,
};

Button.propTypes = {
  isLoading: PropTypes.bool,
  secondary: PropTypes.bool,
  borderless: PropTypes.bool,
  tertiary: PropTypes.bool,
  icon: PropTypes.string,
  disabled: PropTypes.bool,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.oneOf(['text', 'error', 'success']),
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  submit: PropTypes.bool,
  rounded: PropTypes.bool,
};

export default Button;
