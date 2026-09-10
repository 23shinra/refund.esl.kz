import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth}px;
  margin: 28px auto;
  padding: 0 16px;
`;

const StyledCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow.md};
  padding: 18px;
`;

const StyledTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 18px;
`;

const StyledText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export class ErrorBoundary extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    title: PropTypes.string,
    message: PropTypes.string,
  };

  static defaultProps = {
    title: 'Что-то пошло не так',
    message: 'Перезагрузите страницу. Если ошибка повторяется — проверьте данные или обратитесь к администратору.',
  };

  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error('UI crashed:', error);
  }

  render() {
    if (this.state.hasError) {
      const { title, message } = this.props;
      return (
        <StyledWrap>
          <StyledCard role="alert">
            <StyledTitle>{title}</StyledTitle>
            <StyledText>{message}</StyledText>
          </StyledCard>
        </StyledWrap>
      );
    }
    return this.props.children;
  }
}

