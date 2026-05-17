package com.example.gtemp.dto; // Adjust this package to match your project structure

public class PurchaseRequest {
    private String buyerUsername;
    private String sellerUsername;
    private double amount;

    // Default Constructor (Required by Jackson for JSON deserialization)
    public PurchaseRequest() {
    }

    public PurchaseRequest(String buyerUsername, String sellerUsername, double amount) {
        this.buyerUsername = buyerUsername;
        this.sellerUsername = sellerUsername;
        this.amount = amount;
    }

    // Getters and Setters
    public String getBuyerUsername() {
        return buyerUsername;
    }

    public void setBuyerUsername(String buyerUsername) {
        this.buyerUsername = buyerUsername;
    }

    public String getSellerUsername() {
        return sellerUsername;
    }

    public void setSellerUsername(String sellerUsername) {
        this.sellerUsername = sellerUsername;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }
}