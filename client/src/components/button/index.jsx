import { Icon } from '@dataesr/react-dsfr';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';

import Loader from './loader';

import './button.scss';

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
    'btn-keep': color === 'VALIDATED',
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
  borderless: false,
  children: '',
  className: '',
  color: null,
  disabled: false,
  icon: '',
  iconPosition: 'left',
  isLoading: false,
  rounded: false,
  secondary: false,
  size: 'md',
  submit: false,
  tertiary: false,
};

Button.propTypes = {
  borderless: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  color: PropTypes.oneOf(['text', 'error', 'success', 'keep', 'VALIDATED']),
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  isLoading: PropTypes.bool,
  rounded: PropTypes.bool,
  secondary: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  submit: PropTypes.bool,
  tertiary: PropTypes.bool,
};

export default Button;
