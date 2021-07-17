import { Button as AntButton } from 'antd';
import Icon from './Icon';

const Button = ({ icon, children, className, ...props }) => (
  <AntButton {...props} className={className}>
    <>
      {icon && <Icon type={icon} />}
      {children}
    </>
  </AntButton>
);

export default Button;
