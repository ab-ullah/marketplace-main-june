import API from '../../src/api/backendApi';


class FeatureFlagManager {

    async isFeatureEnabled(featureName: string) {
        try {
            const response = await API.fetchFeatureFlag(featureName);
            return response.is_active
        } catch (error) {
            console.error('Error fetching feature flags:', error);
        }
    }
}

export default FeatureFlagManager