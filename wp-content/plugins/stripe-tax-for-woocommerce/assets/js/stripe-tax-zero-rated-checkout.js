/**
 * Stripe Tax - Zero-rated checkout line.
 *
 * Adds a fallback tax row for block checkout when Stripe confirms
 * an all-zero-rated taxable result.
 *
 * @package Stripe\StripeTaxForWooCommerce
 */

(function () {
	var config = window.stripeTaxZeroRatedLine || {};

	if ( ! config.ajaxUrl || ! config.action ) {
		return;
	}

	var shouldShow = false;
	var fetchInFlight = false;
	var refreshTimer = null;
	var observerRenderScheduled = false;

	function isBlocksCartOrCheckoutPage() {
		return !! document.querySelector(
			'.wp-block-woocommerce-checkout, .wc-block-checkout, .wp-block-woocommerce-cart, .wc-block-cart, '
			+ '.wp-block-woocommerce-checkout-order-summary-totals-block, .wp-block-woocommerce-cart-order-summary-totals-block, '
			+ '.woocommerce-checkout-order-summary-totals-block, .woocommerce-cart-order-summary-totals-block'
		);
	}

	function getSummaryTotalsContainer() {
		var checkoutRoot = document.querySelector( '.wp-block-woocommerce-checkout, .wc-block-checkout' );
		if ( checkoutRoot ) {
			var checkoutTotals = checkoutRoot.querySelector(
				'.wp-block-woocommerce-checkout-order-summary-totals-block, .woocommerce-checkout-order-summary-totals-block'
			);

			if ( checkoutTotals ) {
				return checkoutTotals;
			}
		}

		var cartRoot = document.querySelector( '.wp-block-woocommerce-cart, .wc-block-cart' );
		if ( cartRoot ) {
			var cartTotals = cartRoot.querySelector(
				'.wp-block-woocommerce-cart-order-summary-totals-block, .woocommerce-cart-order-summary-totals-block'
			);

			if ( cartTotals ) {
				return cartTotals;
			}
		}

		// Fallback for markup variants while still preferring summary totals blocks.
		return document.querySelector(
			'.wp-block-woocommerce-checkout-order-summary-totals-block, '
			+ '.woocommerce-checkout-order-summary-totals-block, '
			+ '.wp-block-woocommerce-cart-order-summary-totals-block, '
			+ '.woocommerce-cart-order-summary-totals-block, '
			+ '.wc-block-components-totals-wrapper'
		);
	}

	function getBlocksRoot() {
		return document.querySelector( '.wp-block-woocommerce-checkout, .wc-block-checkout, .wp-block-woocommerce-cart, .wc-block-cart' );
	}

	function getTotalsInsertionContext( container ) {
		var searchRoot = getBlocksRoot() || container || document;

		var footer = null;
		var footers = searchRoot.querySelectorAll( '.wc-block-components-totals-footer-item' );

		if ( footers.length > 0 ) {
			footer = footers[ footers.length - 1 ];
		}

		if ( footer && footer.parentNode ) {
			return {
				parent: footer.parentNode,
				footer: footer,
			};
		}

		var wrapper = searchRoot.querySelector( '.wc-block-components-totals-wrapper' );
		if ( wrapper ) {
			footer = wrapper.querySelector( '.wc-block-components-totals-footer-item' );
			if ( footer && footer.parentNode ) {
				return {
					parent: footer.parentNode,
					footer: footer,
				};
			}

			return {
				parent: wrapper,
				footer: null,
			};
		}

		return {
			parent: searchRoot,
			footer: null,
		};
	}

	function getAmountText() {
		var rawValue = config.amount || '0';
		var parser = document.createElement( 'textarea' );
		parser.innerHTML = rawValue;
		return parser.value;
	}

	if ( ! isBlocksCartOrCheckoutPage() ) {
		return;
	}

	function getExistingWooTaxRow( scope ) {
		if ( ! scope || ! scope.querySelectorAll ) {
			return null;
		}

		var rows = scope.querySelectorAll(
			'.wc-block-components-totals-item.wc-block-components-totals-taxes, '
			+ '.wc-block-components-totals-item--tax, '
			+ '.wc-block-components-order-summary__taxes'
		);

		for ( var i = 0; i < rows.length; i++ ) {
			if ( 'stripe-tax-zero-rated-line' !== rows[ i ].id ) {
				return rows[ i ];
			}
		}

		var configuredTaxLabel = ( config.taxLabel || 'Tax' ).toString().trim().toLowerCase();
		var configuredZeroRatedLabel = ( config.label || 'Tax (zero-rated)' ).toString().trim().toLowerCase();
		var allRows = scope.querySelectorAll( '.wc-block-components-totals-item' );

		for ( i = 0; i < allRows.length; i++ ) {
			if ( 'stripe-tax-zero-rated-line' === allRows[ i ].id ) {
				continue;
			}

			var labelNode = allRows[ i ].querySelector( '.wc-block-components-totals-item__label' );
			if ( ! labelNode ) {
				continue;
			}

			var labelText = labelNode.textContent ? labelNode.textContent.toString().trim().toLowerCase() : '';
			if ( ! labelText || labelText === configuredZeroRatedLabel ) {
				continue;
			}

			if ( labelText.indexOf( configuredTaxLabel ) === 0 ) {
				return allRows[ i ];
			}
		}

		return null;
	}

	function getLastRegularTotalsItem( scope ) {
		if ( ! scope || ! scope.querySelectorAll ) {
			return null;
		}

		var items = scope.querySelectorAll( '.wc-block-components-totals-item' );
		var last = null;

		for ( var i = 0; i < items.length; i++ ) {
			if ( 'stripe-tax-zero-rated-line' === items[ i ].id ) {
				continue;
			}

			if ( items[ i ].classList && items[ i ].classList.contains( 'wc-block-components-totals-footer-item' ) ) {
				continue;
			}

			last = items[ i ];
		}

		return last;
	}

	function placeRowAtBottom( row, container, context ) {
		if ( ! row || ! context || ! context.parent ) {
			return;
		}

		var scope = container || context.parent;
		var lastRegularItem = getLastRegularTotalsItem( scope );

		if ( lastRegularItem && lastRegularItem.parentNode ) {
			if ( row.parentNode !== lastRegularItem.parentNode || lastRegularItem.nextSibling !== row ) {
				if ( lastRegularItem.nextSibling ) {
					lastRegularItem.parentNode.insertBefore( row, lastRegularItem.nextSibling );
				} else {
					lastRegularItem.parentNode.appendChild( row );
				}
			}

			return;
		}

		if ( context.footer ) {
			if ( row.parentNode !== context.parent || row.nextSibling !== context.footer ) {
				context.parent.insertBefore( row, context.footer );
			}
		} else if ( row.parentNode !== context.parent || row !== context.parent.lastChild ) {
			context.parent.appendChild( row );
		}
	}

	function createRow() {
		var container = getSummaryTotalsContainer();
		var context = getTotalsInsertionContext( container );

		if ( ! context || ! context.parent ) {
			return null;
		}

		var row = document.createElement( 'div' );
		row.id = 'stripe-tax-zero-rated-line';
		row.className = 'wc-block-components-totals-item wc-block-components-totals-taxes';

		var label = document.createElement( 'span' );
		label.className = 'wc-block-components-totals-item__label';
		label.textContent = config.label || 'Tax (zero-rated)';
		row.appendChild( label );

		var value = document.createElement( 'span' );
		value.className = 'wc-block-components-totals-item__value';
		value.textContent = getAmountText();
		row.appendChild( value );

		var description = document.createElement( 'div' );
		description.className = 'wc-block-components-totals-item__description';
		row.appendChild( description );

		placeRowAtBottom( row, container, context );

		return row;
	}

	function cartHasTax() {
		var inclusiveNote = document.querySelector( '.wc-block-components-totals-footer-item-tax' );
		if ( inclusiveNote && inclusiveNote.textContent && inclusiveNote.textContent.trim() ) {
			return true;
		}

		var wpData = window.wp && window.wp.data;
		if ( ! wpData || ! wpData.select ) {
			return false;
		}

		try {
			var store = wpData.select( 'wc/store/cart' );
			var cart = store && store.getCartData ? store.getCartData() : null;
			var totals = cart && cart.totals ? cart.totals : null;

			return !! totals && ( parseInt( totals.total_tax, 10 ) || 0 ) > 0;
		} catch ( e ) {
			return false;
		}
	}

	function renderRow() {
		if ( ! isBlocksCartOrCheckoutPage() ) {
			return;
		}

		var container = getSummaryTotalsContainer();
		var context = getTotalsInsertionContext( container );
		var scope = context && context.parent ? context.parent : ( container || getBlocksRoot() || document );

		var row = document.getElementById( 'stripe-tax-zero-rated-line' );
		var hasWooTaxRow = !! getExistingWooTaxRow( scope ) || !! getExistingWooTaxRow( container || getBlocksRoot() || document );

		if ( ! shouldShow || hasWooTaxRow || cartHasTax() ) {
			if ( row ) {
				row.remove();
			}
			return;
		}

		if ( ! context || ! context.parent ) {
			return;
		}

		if ( row && ! scope.contains( row ) ) {
			row.remove();
			row = null;
		}

		if ( ! row ) {
			row = createRow();
		}

		if ( ! row ) {
			return;
		}

		// Keep zero-rated line right after the last non-footer totals row.
		placeRowAtBottom( row, container, context );

		var labelNode = row.querySelector( '.wc-block-components-totals-item__label' );
		var valueNode = row.querySelector( '.wc-block-components-totals-item__value' );
		var nextLabel = config.label || 'Tax (zero-rated)';
		var nextValue = getAmountText();
		if ( labelNode ) {
			if ( labelNode.textContent !== nextLabel ) {
				labelNode.textContent = nextLabel;
			}
		}
		if ( valueNode ) {
			if ( valueNode.textContent !== nextValue ) {
				valueNode.textContent = nextValue;
			}
		}
	}

	function fetchStatus() {
		if ( fetchInFlight ) {
			return;
		}

		var separator = config.ajaxUrl.indexOf( '?' ) === -1 ? '?' : '&';
		var url = config.ajaxUrl + separator + 'action=' + encodeURIComponent( config.action );

		fetchInFlight = true;

		fetch( url, { credentials: 'same-origin' } )
			.then( function ( response ) {
				return response.json();
			} )
			.then( function ( payload ) {
				if ( payload && payload.success && payload.data ) {
					shouldShow = !! payload.data.show;
					renderRow();
				}
			} )
			.catch( function () {
				// Keep current state; next poll may recover.
			} )
			.finally( function () {
				fetchInFlight = false;
			} );
	}

	function scheduleStatusRefresh() {
		if ( refreshTimer ) {
			clearTimeout( refreshTimer );
		}

		refreshTimer = setTimeout( function () {
			fetchStatus();
		}, 500 );
	}

	if ( 'MutationObserver' in window ) {
		var observerTarget = document.querySelector( '.wp-block-woocommerce-checkout, .wc-block-checkout, .wp-block-woocommerce-cart, .wc-block-cart' );
		if ( observerTarget ) {
			var observer = new MutationObserver( function () {
				if ( observerRenderScheduled ) {
					return;
				}

				observerRenderScheduled = true;
				window.requestAnimationFrame( function () {
					observerRenderScheduled = false;
					renderRow();
					scheduleStatusRefresh();
				} );
			} );
			observer.observe( observerTarget, { childList: true, subtree: true } );
		}
	}

	document.addEventListener( 'change', function ( event ) {
		if ( ! event.target || ! event.target.closest ) {
			return;
		}

		if ( event.target.closest( '.wp-block-woocommerce-checkout, .wc-block-checkout, .wp-block-woocommerce-cart, .wc-block-cart' ) ) {
			scheduleStatusRefresh();
		}
	} );

	window.addEventListener( 'focus', function () {
		scheduleStatusRefresh();
	} );

	fetchStatus();
	renderRow();
	setTimeout( fetchStatus, 800 );
	setTimeout( fetchStatus, 2200 );
})();







