import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import RankingQuestionnaire from './RankingQuestionnaire';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RankingQuestionnaire', () => {
    const mockProducts = [
        "1. Dell XPS 15 - $1,499",
        "2. MacBook Air M1 - $999",
        "3. Lenovo ThinkPad X1 - $1,299"
    ];
    
    const mockSearchQuery = 'laptop';
    const mockOnRankingComplete = jest.fn();

    const mockQuestionnaire = `1. What is your primary concern when choosing between these products?
A) Price and value for money
B) Performance and speed
C) Build quality and durability
D) Brand reputation and support

2. How important is portability vs performance for your needs?
A) Maximum performance, weight not important
B) Balance of both portability and performance
C) Highly portable, moderate performance
D) Ultra-portable, basic performance needs`;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        render(
            <RankingQuestionnaire
                products={mockProducts}
                searchQuery={mockSearchQuery}
                onRankingComplete={mockOnRankingComplete}
            />
        );

        expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
        expect(screen.getByText(/Analyzing products/)).toBeInTheDocument();
    });

    it('displays questionnaire after loading', async () => {
        mockedAxios.post.mockResolvedValueOnce({
            data: { questionnaire: mockQuestionnaire }
        });

        render(
            <RankingQuestionnaire
                products={mockProducts}
                searchQuery={mockSearchQuery}
                onRankingComplete={mockOnRankingComplete}
            />
        );

        await waitFor(() => {
            expect(screen.getByText(/What is your primary concern/)).toBeInTheDocument();
        });

        expect(screen.getByText(/Price and value for money/)).toBeInTheDocument();
        expect(screen.getByText(/Performance and speed/)).toBeInTheDocument();
    });

    it('handles user selecting options and submitting', async () => {
        mockedAxios.post
            .mockResolvedValueOnce({
                data: { questionnaire: mockQuestionnaire }
            })
            .mockResolvedValueOnce({
                data: { ranked_products: mockProducts }
            });

        render(
            <RankingQuestionnaire
                products={mockProducts}
                searchQuery={mockSearchQuery}
                onRankingComplete={mockOnRankingComplete}
            />
        );

        // Wait for questionnaire to load
        await waitFor(() => {
            expect(screen.getByText(/What is your primary concern/)).toBeInTheDocument();
        });

        // Select first option
        fireEvent.click(screen.getByText(/Price and value for money/));

        // Wait for second question
        await waitFor(() => {
            expect(screen.getByText(/How important is portability/)).toBeInTheDocument();
        });

        // Select second option
        fireEvent.click(screen.getByText(/Balance of both portability and performance/));

        // Verify ranking completion
        await waitFor(() => {
            expect(mockOnRankingComplete).toHaveBeenCalledWith(mockProducts);
        });
    });

    it('handles API errors gracefully', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

        render(
            <RankingQuestionnaire
                products={mockProducts}
                searchQuery={mockSearchQuery}
                onRankingComplete={mockOnRankingComplete}
            />
        );

        await waitFor(() => {
            expect(screen.getByText(/Error/)).toBeInTheDocument();
        });
    });

    it('parses questionnaire correctly', async () => {
        mockedAxios.post.mockResolvedValueOnce({
            data: { questionnaire: mockQuestionnaire }
        });

        render(
            <RankingQuestionnaire
                products={mockProducts}
                searchQuery={mockSearchQuery}
                onRankingComplete={mockOnRankingComplete}
            />
        );

        await waitFor(() => {
            const question = screen.getByText(/What is your primary concern/);
            const option1 = screen.getByText(/Price and value for money/);
            const option2 = screen.getByText(/Performance and speed/);
            const option3 = screen.getByText(/Build quality and durability/);
            const option4 = screen.getByText(/Brand reputation and support/);

            expect(question).toBeInTheDocument();
            expect(option1).toBeInTheDocument();
            expect(option2).toBeInTheDocument();
            expect(option3).toBeInTheDocument();
            expect(option4).toBeInTheDocument();
        });
    });
}); 