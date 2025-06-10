export interface Feature {
    name: string
    description: string
}
export interface CompanyFeatureFlag {
    active: boolean
    feature: Feature
    modified_at: string
}
