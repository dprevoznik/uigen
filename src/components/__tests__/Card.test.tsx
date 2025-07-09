import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Card from '../Card';

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card />);
    
    expect(screen.getByText('Welcome to Our Service')).toBeInTheDocument();
    expect(screen.getByText('Discover amazing features and capabilities that will transform your experience.')).toBeInTheDocument();
  });

  it('renders with custom title and description', () => {
    render(
      <Card 
        title="Custom Title" 
        description="Custom description text" 
      />
    );
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
  });

  it('renders with image when imageUrl is provided', () => {
    render(
      <Card 
        title="Test Card"
        imageUrl="https://example.com/image.jpg"
      />
    );
    
    const image = screen.getByAltText('Test Card');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders actions when provided', () => {
    const testButton = <button>Test Action</button>;
    render(<Card actions={testButton} />);
    
    expect(screen.getByText('Test Action')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class" />);
    const cardElement = container.firstChild;
    
    expect(cardElement).toHaveClass('custom-class');
  });

  it('applies different variants correctly', () => {
    const { container: defaultContainer } = render(<Card variant="default" />);
    const { container: outlinedContainer } = render(<Card variant="outlined" />);
    const { container: elevatedContainer } = render(<Card variant="elevated" />);
    
    expect(defaultContainer.firstChild).toHaveClass('shadow-md');
    expect(outlinedContainer.firstChild).toHaveClass('border');
    expect(elevatedContainer.firstChild).toHaveClass('shadow-lg');
  });

  it('applies different sizes correctly', () => {
    const { container: smContainer } = render(<Card size="sm" />);
    const { container: mdContainer } = render(<Card size="md" />);
    const { container: lgContainer } = render(<Card size="lg" />);
    
    expect(smContainer.firstChild).toHaveClass('max-w-sm');
    expect(mdContainer.firstChild).toHaveClass('max-w-md');
    expect(lgContainer.firstChild).toHaveClass('max-w-lg');
  });

  it('applies correct text sizes based on card size', () => {
    render(<Card size="sm" title="Small Title" />);
    expect(screen.getByText('Small Title')).toHaveClass('text-lg');

    render(<Card size="md" title="Medium Title" />);
    expect(screen.getByText('Medium Title')).toHaveClass('text-xl');

    render(<Card size="lg" title="Large Title" />);
    expect(screen.getByText('Large Title')).toHaveClass('text-2xl');
  });

  it('does not render image when imageUrl is not provided', () => {
    render(<Card title="No Image Card" />);
    
    expect(screen.queryByAltText('No Image Card')).not.toBeInTheDocument();
  });

  it('does not render actions section when actions are not provided', () => {
    const { container } = render(<Card />);
    
    // Check that there's no actions container
    const actionsContainer = container.querySelector('.mt-4.flex.flex-wrap.gap-2');
    expect(actionsContainer).not.toBeInTheDocument();
  });
});