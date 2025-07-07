# Swipeable Cards for Mobile Layout

This feature adds mobile-specific swipe gesture support to content cards, allowing users to swipe left or right to reveal action buttons (like delete, edit, favorite, etc). This implementation preserves the desktop experience while enhancing mobile usability.

## Demo

Visit `/swipeable-cards-demo` on your mobile device to see the swipeable cards in action. The demo showcases:

- Cards with right-side actions (swipe left to reveal)
- Cards with left-side actions (swipe right to reveal)
- Cards with actions on both sides
- Haptic feedback during swipes
- Clean animations and transitions

## Features

- ✅ Mobile-only implementation (doesn't affect desktop)
- ✅ Smooth swipe animations
- ✅ Haptic feedback on iOS and Android
- ✅ Customizable actions with icons
- ✅ Left and right swipe support
- ✅ Swipe threshold for activation
- ✅ Touch-optimized interactions
- ✅ Accessibility considerations
- ✅ Easy to implement in existing components

## Implementation Files

- `components/SwipeableCard.tsx` - The main component
- `components/SwipeableCardExample.tsx` - Usage example
- `app/swipeable-cards-demo/page.tsx` - Demo page
- `utils/hapticFeedback.ts` - Haptic feedback utilities
- Mobile-specific CSS in `app/globals.css`

## How to Use

### 1. Basic Implementation

```tsx
import SwipeableCard from '@/components/SwipeableCard'

// Inside your component
;<SwipeableCard
	rightActions={[
		{
			icon: 'fa-edit',
			label: 'Edit',
			color: '#3b82f6',
			onAction: () => handleEdit(item.id),
		},
		{
			icon: 'fa-trash',
			label: 'Delete',
			color: '#ef4444',
			onAction: () => handleDelete(item.id),
		},
	]}
>
	<div className='bg-white p-4 rounded-lg'>
		<h3 className='font-semibold'>{item.title}</h3>
		<p className='text-sm text-gray-600'>{item.description}</p>
	</div>
</SwipeableCard>
```

### 2. With Left and Right Actions

```tsx
<SwipeableCard
	leftActions={[
		{
			icon: 'fa-star',
			label: 'Favorite',
			color: '#f59e0b',
			onAction: () => handleFavorite(item.id),
		},
	]}
	rightActions={[
		{
			icon: 'fa-archive',
			label: 'Archive',
			color: '#8b5cf6',
			onAction: () => handleArchive(item.id),
		},
		{
			icon: 'fa-trash',
			label: 'Delete',
			color: '#ef4444',
			onAction: () => handleDelete(item.id),
		},
	]}
>
	{/* Card content */}
</SwipeableCard>
```

### 3. With State Tracking

```tsx
const [openCardId, setOpenCardId] = useState<string | null>(null)

const handleSwipeStateChange = (id: string, isOpen: boolean, direction: 'left' | 'right' | null) => {
	setOpenCardId(isOpen ? id : null)
}

// Then in your card list
{
	items.map((item) => (
		<SwipeableCard
			key={item.id}
			onSwipeStateChange={(isOpen, direction) => handleSwipeStateChange(item.id, isOpen, direction)}
			// Other props...
		>
			{/* Card content */}
		</SwipeableCard>
	))
}
```

## Props

| Prop                 | Type                          | Description                                  |
| -------------------- | ----------------------------- | -------------------------------------------- |
| `children`           | `ReactNode`                   | Content of the card                          |
| `rightActions`       | `SwipeAction[]`               | Actions to show on right (when swiping left) |
| `leftActions`        | `SwipeAction[]`               | Actions to show on left (when swiping right) |
| `className`          | `string`                      | Additional classes to apply to the container |
| `onSwipeStateChange` | `(isOpen, direction) => void` | Callback when card swipe state changes       |
| `disabled`           | `boolean`                     | Disable swiping functionality                |

## SwipeAction Properties

| Property   | Type         | Description                               |
| ---------- | ------------ | ----------------------------------------- |
| `icon`     | `string`     | FontAwesome icon class (e.g., 'fa-trash') |
| `label`    | `string`     | Text label for the action                 |
| `color`    | `string`     | Background color of the action button     |
| `onAction` | `() => void` | Function to call when action is selected  |

## Best Practices

1. **Use on Mobile-Optimized Pages**: Swipeable cards work best on pages specifically designed for mobile users.

2. **Use Clear Visual Indicators**: Include subtle visual cues that indicate swipeability.

3. **Keep Actions Simple**: Limit to 2-3 actions per side for best user experience.

4. **Use Semantic Colors**: Follow color conventions (red for delete, blue for edit, etc).

5. **Provide Touch Feedback**: The component includes haptic feedback by default.

6. **Alternative Actions**: Always provide alternative ways to access the same actions for accessibility.

7. **Test on Real Devices**: Swipe interactions can feel different across devices.

## Browser Compatibility

- The swipe functionality is only enabled on mobile devices.
- Supports all modern mobile browsers including Safari (iOS) and Chrome (Android).
- Haptic feedback is available on devices that support the Vibration API.
- Gracefully degrades on unsupported browsers.

## Accessibility Considerations

- All actions are keyboard accessible on desktop.
- ARIA attributes are used for screenreader support.
- Alternative methods to access actions should be provided.
- Touch targets are sized appropriately (min 44px).

## Customization

The SwipeableCard component is designed to be highly customizable:

- Appearance can be modified through the CSS in `app/globals.css`
- Behavior thresholds can be adjusted in the component
- Action colors and icons are fully customizable

## Troubleshooting

- If swipe actions don't appear, ensure you're viewing on a mobile device or using mobile emulation.
- If haptic feedback doesn't work, check that the device supports vibration and has it enabled.
- For rendering issues, check that FontAwesome icons are properly loaded.
