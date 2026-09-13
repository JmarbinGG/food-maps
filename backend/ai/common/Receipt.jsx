import { useState } from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '../../utils/helpers';

async function patchFoodListings(ids, status) {
    for (const id of ids) {
        console.warn('Receipt listing status update skipped (Food Maps claims flow):', id, status);
    }
}

/**
 * Receipt Component - Displays aggregated food claims
 * Three states: pending (green "Pick Up"), completed (grey), expired (orange "Reclaim")
 */
export default function Receipt({ receipt, items, onUpdate }) {
    const [loading, setLoading] = useState(false);

    // A receipt is effectively expired if it's still pending but the pickup
    // deadline has passed. The DB cron/RPC will eventually flip the status,
    // but we render the expired UI immediately so users aren't confused.
    const isPastDeadline = (() => {
        if (!receipt?.pickup_by) return false;
        const deadline = new Date(receipt.pickup_by).getTime();
        return Number.isFinite(deadline) && deadline < Date.now();
    })();
    const effectiveStatus = receipt.status === 'pending' && isPastDeadline
        ? 'expired'
        : receipt.status;

    // Determine receipt state and styling
    const getReceiptState = () => {
        if (effectiveStatus === 'completed') {
            return {
                headerClass: 'bg-gray-400',
                buttonText: 'Complete',
                buttonClass: 'bg-gray-400 cursor-not-allowed',
                buttonDisabled: true
            };
        } else if (effectiveStatus === 'expired') {
            return {
                headerClass: 'bg-orange-500',
                buttonText: 'Reclaim',
                buttonClass: 'bg-primary-600 hover:bg-primary-700 shadow-lg',
                buttonDisabled: false
            };
        } else {
            return {
                headerClass: 'bg-primary-600',
                buttonText: 'Pick Up',
                buttonClass: 'bg-primary-600 hover:bg-primary-700 shadow-lg',
                buttonDisabled: false
            };
        }
    };

    const state = getReceiptState();

    // Handle pickup button click
    const handlePickup = async () => {
        if (loading) return;
        alert('Receipt pickup updates are managed in the Food Maps app claims flow.');
    };

    // Handle reclaim button click (for expired receipts)
    const handleReclaim = async () => {
        if (loading) return;
        alert('Receipt reclaim is managed in the Food Maps app claims flow.');
    };


    const handleButtonClick = () => {
        if (effectiveStatus === 'expired') {
            handleReclaim();
        } else if (effectiveStatus === 'pending') {
            handlePickup();
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 max-w-sm">
            {/* Header */}
            <div className={`${state.headerClass} text-white px-6 py-4`}>
                <h3 className="text-xl font-bold">Receipt</h3>
            </div>

            {/* Expired Notice (if applicable) */}
            {effectiveStatus === 'expired' && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mx-4 mt-4">
                    <p className="text-sm text-orange-800">
                        <strong>Claim Expired:</strong> This claim was not picked up by the Friday deadline and has been 
                        automatically expired. The items have been returned to inventory. Click Reclaim if you 
                        would like to claim them again. Some items may no longer be available.
                    </p>
                </div>
            )}

            {/* Items List */}
            <div className="px-6 py-6">
                <div className="space-y-2 mb-6">
                    {items.map((item, index) => (
                        <div key={index} className="flex justify-between text-gray-800">
                            <span className="font-medium">{item.food_name || item.name}</span>
                            <span className="ml-4">{item.amount || item.quantity || 1}</span>
                        </div>
                    ))}
                </div>

                {/* Pickup Location */}
                <div className="border-t pt-4 mt-4 text-sm text-gray-700 space-y-1">
                    <p className="font-semibold">Pick-up location: {receipt.pickup_location}</p>
                    <p><strong>Address:</strong> {receipt.pickup_address}</p>
                    <p><strong>Pick-up window:</strong> {receipt.pickup_window}</p>
                </div>

                {/* Dates */}
                <div className="mt-4 text-xs text-gray-500">
                    <p>Claimed: {formatDate(receipt.claimed_at)}</p>
                    <p>Pickup by: {formatDate(receipt.pickup_by)}</p>
                    {receipt.picked_up_at && (
                        <p>Picked up: {formatDate(receipt.picked_up_at)}</p>
                    )}
                </div>
            </div>

            {/* Action Button */}
            <div className="px-6 pb-6">
                <button
                    onClick={handleButtonClick}
                    disabled={state.buttonDisabled || loading}
                    className={`w-full py-3 rounded-full text-white font-bold text-lg transition-all duration-200 ${state.buttonClass}`}
                >
                    {loading ? 'Processing...' : state.buttonText}
                </button>
            </div>

            {effectiveStatus === 'expired' && (
                <div className="bg-orange-500 text-white px-6 py-4 text-center border-t-4 border-orange-600">
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-100 mb-1">
                        Expiration date
                    </p>
                    <p className="text-lg font-extrabold tracking-tight">
                        {formatDate(receipt.expired_at || receipt.pickup_by)}
                    </p>
                </div>
            )}
        </div>
    );
}

Receipt.propTypes = {
    receipt: PropTypes.shape({
        id: PropTypes.string.isRequired,
        user_id: PropTypes.string.isRequired,
        status: PropTypes.oneOf(['pending', 'completed', 'expired']).isRequired,
        pickup_location: PropTypes.string,
        pickup_address: PropTypes.string,
        pickup_window: PropTypes.string,
        claimed_at: PropTypes.string.isRequired,
        pickup_by: PropTypes.string.isRequired,
        picked_up_at: PropTypes.string,
        expired_at: PropTypes.string
    }).isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
        food_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        food_name: PropTypes.string,
        name: PropTypes.string,
        quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        amount: PropTypes.string
    })).isRequired,
    onUpdate: PropTypes.func
};
