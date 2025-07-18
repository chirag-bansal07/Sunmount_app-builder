#!/bin/bash

# Find all .tsx files and replace the API_URL line
find client -name "*.tsx" -type f -exec sed -i 's/const API_URL = import.meta.env.VITE_API_URL;/const API_URL = import.meta.env.VITE_API_URL || "https:\/\/sunmount-app-builder.onrender.com";/g' {} \;

echo "API_URL configuration fixed in all client files"
