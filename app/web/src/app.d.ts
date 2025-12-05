/// <reference types="sveltekit" />

import "viem";

declare global {
  interface Window {
    ethereum?: any;
  }
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
