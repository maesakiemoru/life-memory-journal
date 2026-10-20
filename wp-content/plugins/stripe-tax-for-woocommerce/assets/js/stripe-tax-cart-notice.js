/**
 * Stripe Tax - Cart tax notice.
 *
 * Adds "Tax calculated at checkout" text.
 *
 * @package Stripe\StripeTaxForWooCommerce
 */

(function () {
	var message = window.stripeTaxCartNotice || 'Tax calculated at checkout';

	function hasTaxInfo( footer ) {
		// Check if WC is showing a Taxes row.
		if ( document.querySelector( '.wc-block-components-totals-taxes' ) ) {
			return true;
		}
		// Check if WC is natively showing tax inclusion text.
		if ( footer.querySelector( '.wc-block-components-totals-footer-item-tax:not(#stripe-tax-notice)' ) ) {
			return true;
		}
		return false;
	}

	function addNotice() {
		// Don't add on checkout pages.
		if ( document.querySelector( '.wp-block-woocommerce-checkout' ) ||
			document.querySelector( '.wc-block-checkout' ) ) {
			return;
		}
		var footer = document.querySelector(
			'.wc-block-components-totals-footer-item'
		);
		if ( ! footer ) {
			return;
		}
		var existing = footer.querySelector( '#stripe-tax-notice' );
		// Remove our notice if WC now shows tax info.
		if ( hasTaxInfo( footer ) ) {
			if ( existing ) {
				existing.remove();
			}
			return;
		}
		if ( existing ) {
			return;
		}
		var p         = document.createElement( 'p' );
		p.id          = 'stripe-tax-notice';
		p.className   = 'wc-block-components-totals-footer-item-tax';
		p.textContent = message;
		footer.appendChild( p );
	}

	setInterval( addNotice, 250 );
})();
