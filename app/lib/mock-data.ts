export type User = {
    Id: string;
    Email: string;
    PasswordHash: string;
    IsEmailVerified: boolean;
    CreatedAt: string;
};

export type OneTimeCodeType = "EmailVerification" | "Login" | "PasswordReset";

export type OneTimeCode = {
    Id: string;
    UserId: string;
    Code: string;
    Type: OneTimeCodeType;
    ExpiresAt: string;
    IsUsed: boolean;
};

export type RefreshToken = {
    Id: string;
    UserId: string;
    Token: string;
    ExpiresAt: string;
    IsRevoked: boolean;
    CreatedAt: string;
};

export type Resume = {
    Id: string;
    UserId: string;
    FileName: string;
    FileData: string;
    UploadedAt: string;
};

export type JobAdvertisement = {
    Id: string;
    UserId: string;
    RawText: string;
    CreatedAt: string;
};

export type AnalysisStatus = "Pending" | "InProgress" | "Completed";

export type Analysis = {
    Id: string;
    UserId: string;
    ResumeId: string;
    JobAdvertisementId: string;
    Label: string | null;
    CreatedAt: string;
    Status: AnalysisStatus;
};

export type AnalysisMethod = 0 | 1 | 2;

export type AnalysisResult = {
    Id: string;
    AnalysisId: string;
    Method: AnalysisMethod;
    Score: number;
    Feedback: string;
    CompletedAt: string;
};

export type DashboardHistoryItem = {
    analysisId: string;
    title: string;
    company: string;
    createdAt: string;
    score: number;
    method: AnalysisMethod;
};

export type DashboardData = {
    user: Pick<User, "Id" | "Email" | "IsEmailVerified" | "CreatedAt">;
    latestResume: Pick<Resume, "Id" | "FileName" | "UploadedAt"> | null;
    history: DashboardHistoryItem[];
};

export const mockUsers: User[] = [
    {
        Id: "f2eb6fe0-4e32-4281-a86b-f9d5914f1926",
        Email: "demo@glint.io",
        PasswordHash: "mock-password-hash",
        IsEmailVerified: true,
        CreatedAt: "2026-01-01T09:00:00Z",
    },
];

export const mockOneTimeCodes: OneTimeCode[] = [
    {
        Id: "3da379cc-6809-42e8-84f7-0f9f245f55a2",
        UserId: mockUsers[0].Id,
        Code: "843921",
        Type: "Login",
        ExpiresAt: "2026-03-25T11:15:00Z",
        IsUsed: true,
    },
];

export const mockRefreshTokens: RefreshToken[] = [
    {
        Id: "54ddd0c9-7d0a-4883-be09-d7a2459de013",
        UserId: mockUsers[0].Id,
        Token: "mock-refresh-token",
        ExpiresAt: "2026-04-25T11:00:00Z",
        IsRevoked: false,
        CreatedAt: "2026-03-25T11:00:00Z",
    },
];

export const mockResumes: Resume[] = [
    {
        Id: "7af64f19-ddf7-41af-92ea-a0d89d22d5ad",
        UserId: mockUsers[0].Id,
        FileName: "fredrik_cv_v1.pdf",
        FileData: "JVBERi0xLjQKJcTl8uXrp...",
        UploadedAt: "2026-01-10T14:00:00Z",
    },
    {
        Id: "4b0f311f-1f8d-4f9f-9796-299181950af3",
        UserId: mockUsers[0].Id,
        FileName: "fredrik_cv_v2.pdf",
        FileData: "JVBERi0xLjQKJYGBgYEK...",
        UploadedAt: "2026-03-17T08:30:00Z",
    },
];

export const mockJobAdvertisements: JobAdvertisement[] = [
    {
        Id: "f015eb24-48fd-4ad4-8e11-7282055b5f89",
        UserId: mockUsers[0].Id,
        RawText: "Frontend Engineer at Northstar Labs. React, TypeScript, testing.",
        CreatedAt: "2026-01-14T12:00:00Z",
    },
    {
        Id: "1a2812d0-e4fe-4f0f-bf9a-95dc85e7df92",
        UserId: mockUsers[0].Id,
        RawText: "Product Engineer at Aurora Systems. Fullstack JS, APIs, UX.",
        CreatedAt: "2026-02-02T10:00:00Z",
    },
    {
        Id: "bf03a2cf-127b-4282-86e4-6b2d578e0bca",
        UserId: mockUsers[0].Id,
        RawText: "Senior React Developer at Waveform AB. React architecture, mentoring.",
        CreatedAt: "2026-02-27T16:00:00Z",
    },
    {
        Id: "95f3676e-65ec-420b-8f4b-a228f79dc668",
        UserId: mockUsers[0].Id,
        RawText: "Fullstack Engineer at Tangent Works. Node, .NET APIs, cloud.",
        CreatedAt: "2026-03-18T13:00:00Z",
    },
];

export const mockAnalyses: Analysis[] = [
    {
        Id: "47af24f6-af5d-43a7-ab28-ca1c42ad80ca",
        UserId: mockUsers[0].Id,
        ResumeId: mockResumes[0].Id,
        JobAdvertisementId: mockJobAdvertisements[0].Id,
        Label: "Frontend Engineer - Northstar Labs",
        CreatedAt: "2026-01-15T09:00:00Z",
        Status: "Completed",
    },
    {
        Id: "f39b94e0-e882-4ca3-9f2a-edf25f17257e",
        UserId: mockUsers[0].Id,
        ResumeId: mockResumes[0].Id,
        JobAdvertisementId: mockJobAdvertisements[1].Id,
        Label: "Product Engineer - Aurora Systems",
        CreatedAt: "2026-02-03T09:00:00Z",
        Status: "Completed",
    },
    {
        Id: "7e8876ea-8b09-4ecd-a785-dd786f51a91d",
        UserId: mockUsers[0].Id,
        ResumeId: mockResumes[0].Id,
        JobAdvertisementId: mockJobAdvertisements[2].Id,
        Label: "Senior React Developer - Waveform AB",
        CreatedAt: "2026-02-28T09:00:00Z",
        Status: "Completed",
    },
    {
        Id: "a1680900-f614-4d8f-b4b4-18b2f0bef6c2",
        UserId: mockUsers[0].Id,
        ResumeId: mockResumes[1].Id,
        JobAdvertisementId: mockJobAdvertisements[3].Id,
        Label: "Fullstack Engineer - Tangent Works",
        CreatedAt: "2026-03-19T09:00:00Z",
        Status: "Completed",
    },
];

export const mockAnalysisResults: AnalysisResult[] = [
    {
        Id: "7bb8065f-b916-4c80-85bb-5f0f5ca843e1",
        AnalysisId: mockAnalyses[0].Id,
        Method: 2,
        Score: 62,
        Feedback: "Solid React baseline. Add stronger testing evidence.",
        CompletedAt: "2026-01-15T09:03:00Z",
    },
    {
        Id: "9e3b04ee-87ed-4845-afac-5f66d5c5ac4f",
        AnalysisId: mockAnalyses[1].Id,
        Method: 1,
        Score: 71,
        Feedback: "Good product thinking. Clarify architecture ownership.",
        CompletedAt: "2026-02-03T09:03:00Z",
    },
    {
        Id: "f3fdd58d-dcd4-43b1-a304-e558be0272f4",
        AnalysisId: mockAnalyses[2].Id,
        Method: 0,
        Score: 76,
        Feedback: "Strong alignment in React depth and leadership potential.",
        CompletedAt: "2026-02-28T09:03:00Z",
    },
    {
        Id: "d5a2f881-9c52-468a-8ed6-421d8cf75480",
        AnalysisId: mockAnalyses[3].Id,
        Method: 0,
        Score: 83,
        Feedback: "Very good fit. Add clearer cloud deployment outcomes.",
        CompletedAt: "2026-03-19T09:03:00Z",
    },
];

function parseAnalysisLabel(label: string | null) {
    if (!label) {
        return { title: "Untitled analysis", company: "Unknown company" };
    }

    const [title, company] = label.split(" - ");

    return {
        title: title ?? "Untitled analysis",
        company: company ?? "Unknown company",
    };
}

export function getMockDashboardData(userId = mockUsers[0].Id): DashboardData {
    const user = mockUsers.find((item) => item.Id === userId) ?? mockUsers[0];

    const latestResume =
        mockResumes
            .filter((resume) => resume.UserId === user.Id)
            .sort((a, b) => new Date(b.UploadedAt).getTime() - new Date(a.UploadedAt).getTime())[0] ??
        null;

    const history = mockAnalyses
        .filter((analysis) => analysis.UserId === user.Id)
        .map((analysis) => {
            const result = mockAnalysisResults.find((item) => item.AnalysisId === analysis.Id);
            const label = parseAnalysisLabel(analysis.Label);

            return {
                analysisId: analysis.Id,
                title: label.title,
                company: label.company,
                createdAt: analysis.CreatedAt,
                score: result?.Score ?? 0,
                method: result?.Method ?? 2,
            } satisfies DashboardHistoryItem;
        })
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return {
        user: {
            Id: user.Id,
            Email: user.Email,
            IsEmailVerified: user.IsEmailVerified,
            CreatedAt: user.CreatedAt,
        },
        latestResume: latestResume
            ? {
                    Id: latestResume.Id,
                    FileName: latestResume.FileName,
                    UploadedAt: latestResume.UploadedAt,
                }
            : null,
        history,
    };
}

export function getDashboardStats(history: DashboardHistoryItem[]) {
    const totalAnalyses = history.length;
    const latest = history[history.length - 1]?.score ?? 0;
    const average =
        totalAnalyses === 0
            ? 0
            : Math.round(history.reduce((sum, item) => sum + item.score, 0) / totalAnalyses);
    const first = history[0]?.score ?? 0;

    return {
        totalAnalyses,
        latest,
        average,
        deltaFromFirst: latest - first,
    };
}