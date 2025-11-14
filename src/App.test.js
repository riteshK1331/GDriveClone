import { render,screen } from "@testing-library/react";
import App from "./App";


test('first test case',() => {
  render(<App />);
  const headerElement = document.querySelector('.header h1');
  expect(headerElement).toBeInTheDocument();  
})


test('second test case', () => {
  render(<App />);
  const headerElement = screen.getByText(/Welcome to My App/i);
  const title = screen.getByTitle("AI test");
  expect(title).toBeInTheDocument();
  expect(headerElement).toBeInTheDocument();  
}) 


test('input test case', () => {
  render(<App />);
  const inputElement = document.querySelector('input' );
  const placeholderElement = screen.getByPlaceholderText(/enter your name/i);
  expect(inputElement).toBeInTheDocument();
  expect(placeholderElement).toBeInTheDocument();  
})


test('textarea test case', () => {
  render(<App />);
  const headerElement = document.querySelector('textarea');
  const inputElement = screen.getByPlaceholderText(/enter your address/i);
  expect(headerElement).toHaveAttribute('name','address');
  expect(inputElement).toBeInTheDocument();  
})